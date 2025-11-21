#!/bin/bash
set -e

echo "=== Quick Login Flow Test ==="
echo ""

# Generate unique email
EMAIL="test$(date +%s)@example.com"
echo "Test Email: $EMAIL"
echo ""

# Test 1: Registration
echo "TEST 1: Registration (Auto-Login)"
REGISTER_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c /tmp/test_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"SecurePass123!\",\"name\":\"Test User\"}")

echo "$REGISTER_RESULT"
echo ""

# Check if user object exists
if echo "$REGISTER_RESULT" | grep -q '"user"'; then
  echo "✅ Registration returns user object"
else
  echo "❌ Registration missing user object"
fi

if echo "$REGISTER_RESULT" | grep -q 'HTTP_CODE:201'; then
  echo "✅ Registration HTTP 201"
else
  echo "❌ Registration failed - wrong status code"
fi

echo ""

# Test 2: Token validation
echo "TEST 2: Token Validation (GET /api/auth/me)"
ME_RESULT=$(curl -s http://localhost:3000/api/auth/me \
  -b /tmp/test_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}")

echo "$ME_RESULT"
echo ""

if echo "$ME_RESULT" | grep -q '"id"'; then
  echo "✅ Token works - /me returns user"
else
  echo "❌ Token validation failed"
fi

echo ""

# Test 3: Login
echo "TEST 3: Login Flow"
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c /tmp/test_login_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"SecurePass123!\"}")

echo "$LOGIN_RESULT"
echo ""

if echo "$LOGIN_RESULT" | grep -q '"user"'; then
  echo "✅ Login returns user object"
else
  echo "❌ Login missing user object"
fi

if echo "$LOGIN_RESULT" | grep -q 'HTTP_CODE:200'; then
  echo "✅ Login HTTP 200"
else
  echo "❌ Login failed - wrong status code"
fi

echo ""
echo "=== Test Complete ==="
