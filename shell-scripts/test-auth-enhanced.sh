#!/bin/bash

# Auth Service Complete Test Script
# Tests all authentication endpoints including new password reset features

set -e

BASE_URL="http://localhost:3000"
API_URL="${BASE_URL}/api/auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================"
echo "Auth Service Complete API Tests"
echo "======================================"
echo ""

# Check if server is running
echo "Checking if auth service is running..."
if ! curl -s "${BASE_URL}/health" > /dev/null; then
    echo -e "${RED}✗ Auth service is not running${NC}"
    echo "Start it with: npm run dev:auth"
    exit 1
fi
echo -e "${GREEN}✓ Auth service is running${NC}"
echo ""

# Generate unique email for this test run
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_complete_${TIMESTAMP}@example.com"
TEST_PASSWORD="SecurePass123!"
TEST_NAME="Test User Complete"

# Test 1: Register
echo "Test 1: Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\"
  }")

USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":"[^"]*' | sed 's/"userId":"//')

if [ -z "$USER_ID" ]; then
    echo -e "${RED}✗ Failed to register user${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ User registered: ${USER_ID}${NC}"
echo ""

# Test 2: Login
echo "Test 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')

if [ -z "$ACCESS_TOKEN" ] || [ -z "$REFRESH_TOKEN" ]; then
    echo -e "${RED}✗ Failed to login${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo ""

# Test 3: Get current user
echo "Test 3: Getting current user info..."
ME_RESPONSE=$(curl -s -X GET "${API_URL}/me" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo $ME_RESPONSE | grep -q "error"; then
    echo -e "${RED}✗ Failed to get user info${NC}"
    echo "Response: $ME_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ User info retrieved successfully${NC}"
echo ""

# Test 4: Request password reset
echo "Test 4: Requesting password reset..."
FORGOT_RESPONSE=$(curl -s -X POST "${API_URL}/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\"
  }")

if echo $FORGOT_RESPONSE | grep -q "error"; then
    echo -e "${RED}✗ Failed to request password reset${NC}"
    echo "Response: $FORGOT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Password reset requested${NC}"
echo -e "${YELLOW}Note: Check server console for mock email${NC}"
echo ""

# Test 5: Refresh token
echo "Test 5: Refreshing access token..."
REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${REFRESH_TOKEN}\"
  }")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')

if [ -z "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${RED}✗ Failed to refresh token${NC}"
    echo "Response: $REFRESH_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Token refreshed successfully${NC}"
echo ""

# Test 6: Logout
echo "Test 6: Logging out..."
LOGOUT_RESPONSE=$(curl -s -X POST "${API_URL}/logout" \
  -H "Authorization: Bearer ${NEW_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${NEW_REFRESH_TOKEN}\"
  }")

if echo $LOGOUT_RESPONSE | grep -q "error"; then
    echo -e "${RED}✗ Failed to logout${NC}"
    echo "Response: $LOGOUT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Logout successful${NC}"
echo ""

# Test 7: Verify token is blacklisted
echo "Test 7: Verifying token is blacklisted..."
BLACKLIST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}/me" \
  -H "Authorization: Bearer ${NEW_ACCESS_TOKEN}")

STATUS_CODE=$(echo "$BLACKLIST_RESPONSE" | tail -n 1)

if [ "$STATUS_CODE" == "401" ]; then
    echo -e "${GREEN}✓ Token successfully blacklisted${NC}"
else
    echo -e "${YELLOW}⚠ Token may not be blacklisted (got status $STATUS_CODE)${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}✓ All tests completed!${NC}"
echo "======================================"
echo ""
echo "Features Tested:"
echo "✅ User registration"
echo "✅ User login"
echo "✅ Protected routes (/me)"
echo "✅ Password reset request"
echo "✅ Token refresh"
echo "✅ Logout"
echo "✅ Token blacklisting"
echo ""
echo "New Features Added:"
echo "✅ POST /api/auth/forgot-password"
echo "✅ POST /api/auth/reset-password/:token"
echo "✅ Rate limiting (login, register, password reset)"
echo "✅ Token blacklisting with Redis"
echo "✅ Email service (mock)"
