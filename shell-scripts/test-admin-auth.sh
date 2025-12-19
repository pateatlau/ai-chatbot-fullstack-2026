#!/bin/bash

# Test Admin Auth Token Fix
# This tests that admin-service accepts tokens from BOTH Authorization header AND cookies

echo "=========================================="
echo "🔍 Testing Admin Service Auth Middleware"
echo "=========================================="
echo ""

# Check if admin-service is running
if ! curl -s http://localhost:3002/health > /dev/null; then
  echo "❌ Admin service is not running on port 3002"
  echo "   Please start it with: npm run dev:backend"
  exit 1
fi

echo "✅ Admin service is running"
echo ""

# First, login to get a real token
echo "📝 Step 1: Login to get auth token..."
LOGIN_RESPONSE=$(curl -s -c /tmp/admin-cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token. Login response:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Test 1: Authorization header (localStorage strategy)
echo "🧪 Test 1: Request with Authorization header (localStorage strategy)"
HEADER_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3002/api/admin/stats \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$HEADER_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$HEADER_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Authorization header works! Response:"
  echo "$RESPONSE_BODY" | head -3
else
  echo "❌ Authorization header failed! HTTP $HTTP_CODE"
  echo "$RESPONSE_BODY"
fi
echo ""

# Test 2: Cookie (HttpOnly cookie strategy)
echo "🧪 Test 2: Request with cookie (HttpOnly cookie strategy)"
COOKIE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b /tmp/admin-cookies.txt \
  http://localhost:3002/api/admin/stats)

HTTP_CODE=$(echo "$COOKIE_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$COOKIE_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Cookie authentication works! Response:"
  echo "$RESPONSE_BODY" | head -3
else
  echo "❌ Cookie authentication failed! HTTP $HTTP_CODE"
  echo "$RESPONSE_BODY"
fi
echo ""

# Test 3: No auth (should fail)
echo "🧪 Test 3: Request without auth (should fail with 401)"
NO_AUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:3002/api/admin/stats)

HTTP_CODE=$(echo "$NO_AUTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$NO_AUTH_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "401" ]; then
  echo "✅ Correctly rejected unauthorized request"
  echo "   Error: $(echo "$RESPONSE_BODY" | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
else
  echo "❌ Should have returned 401 but got HTTP $HTTP_CODE"
  echo "$RESPONSE_BODY"
fi
echo ""

# Cleanup
rm -f /tmp/admin-cookies.txt

echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo ""
echo "The fix ensures admin-service auth middleware checks:"
echo "  1. ✅ Authorization header (for localStorage + API calls)"
echo "  2. ✅ HttpOnly cookies (for same-domain production)"
echo ""
echo "This matches the auth-service pattern and allows both strategies."
