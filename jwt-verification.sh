#!/bin/bash

echo "=== JWT SECURITY FIX VERIFICATION ==="
echo ""

# Counter for results
PASS=0
FAIL=0

# Helper function
check() {
  local description=$1
  local cmd=$2
  
  if eval "$cmd" > /dev/null 2>&1; then
    echo "✓ $description"
    ((PASS++))
  else
    echo "✗ $description"
    ((FAIL++))
  fi
}

echo "BACKEND VERIFICATION:"
echo "---"

# Main.ts checks
check "main.ts imports cookie-parser" \
  "grep -q \"import cookieParser\" apps/auth-service/src/main.ts"

check "main.ts uses cookieParser middleware" \
  "grep -q \"app.use(cookieParser())\" apps/auth-service/src/main.ts"

check "main.ts sets credentials header" \
  "grep -q \"Access-Control-Allow-Credentials.*true\" apps/auth-service/src/main.ts"

# Auth controller checks
check "login() sets accessToken cookie" \
  "grep -q \"res.cookie('accessToken'\" apps/auth-service/src/controllers/auth.controller.ts"

check "login() sets refreshToken cookie" \
  "grep -q \"res.cookie('refreshToken'\" apps/auth-service/src/controllers/auth.controller.ts"

check "login() returns user without tokens" \
  "grep -A5 'Set HttpOnly cookies' apps/auth-service/src/controllers/auth.controller.ts | grep -q 'user: result.user'"

check "login() cookie has httpOnly flag" \
  "grep -q \"httpOnly: true\" apps/auth-service/src/controllers/auth.controller.ts"

check "login() cookie has sameSite strict" \
  "grep -q \"sameSite: 'strict'\" apps/auth-service/src/controllers/auth.controller.ts"

check "logout() reads refreshToken from cookies" \
  "grep -q \"req.cookies.refreshToken\" apps/auth-service/src/controllers/auth.controller.ts"

check "logout() clears cookies" \
  "grep -q \"res.clearCookie\" apps/auth-service/src/controllers/auth.controller.ts"

check "refreshToken() reads from cookies" \
  "grep -q \"const refreshToken = req.cookies.refreshToken\" apps/auth-service/src/controllers/auth.controller.ts"

# Auth middleware checks
check "auth middleware checks Authorization header first" \
  "grep -q \"authHeader && authHeader.startsWith('Bearer ')\" apps/auth-service/src/middleware/auth.middleware.ts"

check "auth middleware falls back to cookies" \
  "grep -q \"req.cookies?.accessToken\" apps/auth-service/src/middleware/auth.middleware.ts"

echo ""
echo "FRONTEND VERIFICATION:"
echo "---"

# Auth store checks
check "auth.store doesn't persist accessToken" \
  "grep -q \"// REMOVED: accessToken and refreshToken\" libs/frontend/stores/src/lib/auth.store.ts"

check "auth.store partialize doesn't include tokens" \
  "! grep -q \"accessToken:\" libs/frontend/stores/src/lib/auth.store.ts | head -1 | grep -q 'partialize'"

check "auth.store setAuth doesn't store tokens" \
  "grep -A3 'setAuth:' libs/frontend/stores/src/lib/auth.store.ts | grep -q 'accessToken: null'"

# API client checks
check "auth-mfe has withCredentials" \
  "grep -q \"withCredentials: true\" apps/auth-mfe/src/services/auth.service.ts"

check "chatbot-mfe has withCredentials" \
  "grep -q \"withCredentials: true\" apps/chatbot-mfe/src/api/chatbot.api.ts"

check "admin-mfe has withCredentials" \
  "grep -q \"withCredentials: true\" apps/admin-mfe/src/api/admin.api.ts"

check "profile-mfe has withCredentials" \
  "grep -q \"withCredentials: true\" apps/profile-mfe/src/api/profile.api.ts"

# Component checks
check "Login component calls setAuth with user only" \
  "grep -q \"setAuth(response.user)\" apps/auth-mfe/src/pages/Login.tsx"

check "Register component calls setAuth with user only" \
  "grep -q \"setAuth(response.user)\" apps/auth-mfe/src/pages/Register.tsx"

echo ""
echo "SECURITY CONFIGURATION:"
echo "---"

check "Refresh token has 7-day expiry" \
  "grep -q \"7.*24.*60.*60.*1000\" apps/auth-service/src/controllers/auth.controller.ts"

check "Access token has 15-minute expiry" \
  "grep -q \"15.*60.*1000\" apps/auth-service/src/controllers/auth.controller.ts"

check "Cookie secure flag set based on NODE_ENV" \
  "grep -q \"secure: process.env.NODE_ENV === 'production'\" apps/auth-service/src/controllers/auth.controller.ts"

echo ""
echo "BUILD STATUS:"
echo "---"

if npm run build > /tmp/build.log 2>&1; then
  echo "✓ All projects build successfully"
  ((PASS++))
else
  echo "✗ Build failed"
  ((FAIL++))
fi

echo ""
echo "=== RESULTS ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "✅ ALL VERIFICATIONS PASSED"
  exit 0
else
  echo "❌ SOME VERIFICATIONS FAILED"
  exit 1
fi
