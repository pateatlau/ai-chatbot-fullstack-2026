#!/bin/bash

# JWT Security Fix - Code Verification Tests
# Verifies that all necessary code changes have been made correctly

set -e

echo "======================================"
echo "JWT Security Fix - Code Verification"
echo "======================================"
echo ""

REPO_ROOT="/Users/patea/2026/projects/ai-chatbot-fullstack-2026"
PASS_COUNT=0
FAIL_COUNT=0

# Helper functions
pass() {
    echo "✓ $1"
    ((PASS_COUNT++))
}

fail() {
    echo "✗ $1"
    ((FAIL_COUNT++))
}

# Test 1: cookie-parser installed
echo "TEST 1: Checking if cookie-parser is installed..."
if grep -q "cookie-parser" "$REPO_ROOT/package.json"; then
    pass "cookie-parser found in package.json"
else
    fail "cookie-parser NOT found in package.json"
fi

# Test 2: main.ts has cookie-parser import
echo ""
echo "TEST 2: Checking main.ts for cookie-parser import..."
if grep -q "import cookieParser from 'cookie-parser'" "$REPO_ROOT/apps/auth-service/src/main.ts"; then
    pass "cookie-parser import found"
else
    fail "cookie-parser import NOT found"
fi

# Test 3: main.ts uses cookie-parser middleware
echo ""
echo "TEST 3: Checking main.ts for middleware usage..."
if grep -q "app.use(cookieParser())" "$REPO_ROOT/apps/auth-service/src/main.ts"; then
    pass "cookieParser middleware registered"
else
    fail "cookieParser middleware NOT registered"
fi

# Test 4: CORS includes credentials
echo ""
echo "TEST 4: Checking CORS configuration..."
if grep -q "Access-Control-Allow-Credentials" "$REPO_ROOT/apps/auth-service/src/main.ts"; then
    pass "CORS credentials header configured"
else
    fail "CORS credentials header NOT configured"
fi

# Test 5: Controller login sets cookies
echo ""
echo "TEST 5: Checking auth controller login endpoint..."
if grep -q "res.cookie('accessToken'" "$REPO_ROOT/apps/auth-service/src/controllers/auth.controller.ts"; then
    pass "Login sets accessToken cookie"
else
    fail "Login does NOT set accessToken cookie"
fi

if grep -q "res.cookie('refreshToken'" "$REPO_ROOT/apps/auth-service/src/controllers/auth.controller.ts"; then
    pass "Login sets refreshToken cookie"
else
    fail "Login does NOT set refreshToken cookie"
fi

# Test 6: Controller login doesn't return tokens
echo ""
echo "TEST 6: Checking that login response doesn't include tokens..."
if grep -A 10 "async login" "$REPO_ROOT/apps/auth-service/src/controllers/auth.controller.ts" | grep -q "user: result.user"; then
    pass "Login returns user without tokens"
else
    fail "Login response structure may be incorrect"
fi

# Test 7: Controller logout reads from cookies
echo ""
echo "TEST 7: Checking logout endpoint..."
if grep -q "req.cookies.refreshToken" "$REPO_ROOT/apps/auth-service/src/controllers/auth.controller.ts"; then
    pass "Logout reads from cookies"
else
    fail "Logout does NOT read from cookies"
fi

if grep -q "res.clearCookie('accessToken'" "$REPO_ROOT/apps/auth-service/src/controllers/auth.controller.ts"; then
    pass "Logout clears accessToken cookie"
else
    fail "Logout does NOT clear cookies"
fi

# Test 8: Auth middleware supports cookies
echo ""
echo "TEST 8: Checking auth middleware..."
if grep -q "req.cookies?.accessToken" "$REPO_ROOT/apps/auth-service/src/middleware/auth.middleware.ts"; then
    pass "Auth middleware reads from cookies"
else
    fail "Auth middleware does NOT read from cookies"
fi

if grep -q "Bearer" "$REPO_ROOT/apps/auth-service/src/middleware/auth.middleware.ts"; then
    pass "Auth middleware supports Bearer tokens (backward compat)"
else
    fail "Auth middleware does NOT support Bearer tokens"
fi

# Test 9: Auth store doesn't persist tokens
echo ""
echo "TEST 9: Checking auth store..."
STORE_FILE="$REPO_ROOT/libs/frontend/stores/src/lib/auth.store.ts"
if [ -f "$STORE_FILE" ]; then
    # Check that partialize doesn't include tokens
    if grep -A 5 "partialize:" "$STORE_FILE" | grep -q "isAuthenticated"; then
        if ! grep -A 5 "partialize:" "$STORE_FILE" | grep -q "accessToken"; then
            pass "Auth store doesn't persist accessToken"
        else
            fail "Auth store STILL persists accessToken"
        fi
    fi
    
    if ! grep -A 5 "partialize:" "$STORE_FILE" | grep -q "refreshToken"; then
        pass "Auth store doesn't persist refreshToken"
    else
        fail "Auth store STILL persists refreshToken"
    fi
else
    fail "Auth store file not found"
fi

# Test 10: Auth service configured for credentials
echo ""
echo "TEST 10: Checking auth-mfe services..."
AUTH_SERVICE="$REPO_ROOT/apps/auth-mfe/src/services/auth.service.ts"
if grep -q "withCredentials: true" "$AUTH_SERVICE"; then
    pass "Auth-mfe axios configured with withCredentials"
else
    fail "Auth-mfe axios does NOT have withCredentials"
fi

# Test 11: Chatbot API uses credentials
echo ""
echo "TEST 11: Checking chatbot-mfe API..."
CHATBOT_API="$REPO_ROOT/apps/chatbot-mfe/src/api/chatbot.api.ts"
if grep -q "withCredentials: true" "$CHATBOT_API"; then
    pass "Chatbot API configured with withCredentials"
else
    fail "Chatbot API does NOT have withCredentials"
fi

if ! grep -q "function getAccessToken" "$CHATBOT_API"; then
    pass "getAccessToken function removed from chatbot API"
else
    fail "getAccessToken function STILL in chatbot API"
fi

# Test 12: Admin API uses credentials
echo ""
echo "TEST 12: Checking admin-mfe API..."
ADMIN_API="$REPO_ROOT/apps/admin-mfe/src/api/admin.api.ts"
if grep -q "withCredentials: true" "$ADMIN_API"; then
    pass "Admin API configured with withCredentials"
else
    fail "Admin API does NOT have withCredentials"
fi

if ! grep -q "function getAccessToken" "$ADMIN_API"; then
    pass "getAccessToken function removed from admin API"
else
    fail "getAccessToken function STILL in admin API"
fi

# Test 13: Profile API uses credentials
echo ""
echo "TEST 13: Checking profile-mfe API..."
PROFILE_API="$REPO_ROOT/apps/profile-mfe/src/api/profile.api.ts"
if grep -q "withCredentials: true" "$PROFILE_API"; then
    pass "Profile API configured with withCredentials"
else
    fail "Profile API does NOT have withCredentials"
fi

if ! grep -q "function getAccessToken" "$PROFILE_API"; then
    pass "getAccessToken function removed from profile API"
else
    fail "getAccessToken function STILL in profile API"
fi

# Test 14: Login component updated
echo ""
echo "TEST 14: Checking login component..."
LOGIN_PAGE="$REPO_ROOT/apps/auth-mfe/src/pages/Login.tsx"
if grep -q "setAuth(response.user)" "$LOGIN_PAGE"; then
    pass "Login component calls setAuth(user) only"
else
    fail "Login component may still pass tokens to setAuth"
fi

# Test 15: Register component updated
echo ""
echo "TEST 15: Checking register component..."
REGISTER_PAGE="$REPO_ROOT/apps/auth-mfe/src/pages/Register.tsx"
if grep -q "setAuth(response.user)" "$REGISTER_PAGE"; then
    pass "Register component calls setAuth(user) only"
else
    fail "Register component may still pass tokens to setAuth"
fi

# Test 16: TypeScript compilation
echo ""
echo "TEST 16: Verifying TypeScript compilation..."
if nx build auth-service 2>&1 | grep -q "Successfully"; then
    pass "auth-service compiles successfully"
else
    fail "auth-service build failed"
fi

if nx build auth-mfe 2>&1 | grep -q "Successfully"; then
    pass "auth-mfe compiles successfully"
else
    fail "auth-mfe build failed"
fi

if nx build chatbot-mfe 2>&1 | grep -q "Successfully"; then
    pass "chatbot-mfe compiles successfully"
else
    fail "chatbot-mfe build failed"
fi

# Summary
echo ""
echo "======================================"
echo "VERIFICATION SUMMARY"
echo "======================================"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✓ ALL VERIFICATIONS PASSED!"
    echo ""
    echo "The JWT security fix implementation is complete."
    echo "All code changes have been applied correctly."
    echo ""
    echo "Next steps:"
    echo "1. Start backend services: npm run dev:backend"
    echo "2. Start frontend services: npm run dev:frontend"
    echo "3. Test in browser:"
    echo "   - Login with valid credentials"
    echo "   - Open DevTools → Application → Cookies"
    echo "   - Verify HttpOnly flag is set"
    echo "   - Check localStorage has NO tokens"
    exit 0
else
    echo "✗ Some verifications failed."
    echo "Please review the failures above."
    exit 1
fi
