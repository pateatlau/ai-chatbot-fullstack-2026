#!/bin/bash

echo "==================================="
echo "🧪 Testing Auth Service Backend"
echo "==================================="
echo ""

# Start the service in background
echo "🚀 Starting auth service..."
./apps/auth-service/start.sh &
SERVICE_PID=$!
sleep 3

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

# Test 1: Health Check
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Health Check Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
echo "Response: $HEALTH_RESPONSE"
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✅ PASSED${NC} - Health check working"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Health check failed"
    ((FAILED++))
fi

# Test 2: Register new user
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Register New User"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RANDOM_EMAIL="testuser_$(date +%s)@example.com"
echo "Registering user: $RANDOM_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$RANDOM_EMAIL"'","password":"SecurePass123!","name":"Test User"}')
echo "Response: $REGISTER_RESPONSE"
if echo "$REGISTER_RESPONSE" | grep -q "userId"; then
    echo -e "${GREEN}✅ PASSED${NC} - User registration successful"
    ((PASSED++))
    NEW_USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r .userId)
    echo "New User ID: $NEW_USER_ID"
else
    echo -e "${RED}❌ FAILED${NC} - User registration failed"
    ((FAILED++))
fi

# Test 3: Duplicate email validation
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Duplicate Email Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Attempting to register duplicate email: $RANDOM_EMAIL"
DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$RANDOM_EMAIL"'","password":"SecurePass123!","name":"Test User"}')
echo "Response: $DUPLICATE_RESPONSE"
if echo "$DUPLICATE_RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}✅ PASSED${NC} - Duplicate email correctly rejected"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Duplicate email not handled properly"
    ((FAILED++))
fi

# Test 4: Login with valid credentials
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Login with Valid Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Logging in with: $RANDOM_EMAIL"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$RANDOM_EMAIL"'","password":"SecurePass123!"}')
echo "Response: ${LOGIN_RESPONSE:0:200}..."
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASSED${NC} - Login successful, tokens returned"
    ((PASSED++))
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .refreshToken)
    echo "Access Token: ${ACCESS_TOKEN:0:50}..."
    echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
    echo -e "${RED}❌ FAILED${NC} - Login failed"
    ((FAILED++))
fi

# Test 5: Login with invalid credentials
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Login with Invalid Password"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
INVALID_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$RANDOM_EMAIL"'","password":"WrongPassword123!"}')
echo "Response: $INVALID_LOGIN"
if echo "$INVALID_LOGIN" | grep -q "Invalid email or password"; then
    echo -e "${GREEN}✅ PASSED${NC} - Invalid credentials correctly rejected"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Invalid credentials not handled properly"
    ((FAILED++))
fi

# Test 6: Access protected endpoint with valid token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Protected Endpoint (/me) with Valid Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Response: $ME_RESPONSE"
if echo "$ME_RESPONSE" | grep -q "$RANDOM_EMAIL"; then
    echo -e "${GREEN}✅ PASSED${NC} - Protected endpoint accessible with valid token"
    ((PASSED++))
    echo "User Data Retrieved:"
    echo "$ME_RESPONSE" | jq '{email, name, role, isActive}'
else
    echo -e "${RED}❌ FAILED${NC} - Protected endpoint access failed"
    ((FAILED++))
fi

# Test 7: Access protected endpoint without token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Protected Endpoint without Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
NO_TOKEN_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me)
echo "Response: $NO_TOKEN_RESPONSE"
if echo "$NO_TOKEN_RESPONSE" | grep -q "No token provided"; then
    echo -e "${GREEN}✅ PASSED${NC} - Unauthorized access correctly blocked"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Unauthorized access not handled properly"
    ((FAILED++))
fi

# Test 8: Refresh token
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 8: Refresh Token Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}')
echo "Response: ${REFRESH_RESPONSE:0:200}..."
if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASSED${NC} - Token refresh successful"
    ((PASSED++))
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r .accessToken)
    echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
else
    echo -e "${RED}❌ FAILED${NC} - Token refresh failed"
    ((FAILED++))
fi

# Test 9: Logout
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 9: Logout Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}')
echo "Response: $LOGOUT_RESPONSE"
if echo "$LOGOUT_RESPONSE" | grep -q "Logged out successfully"; then
    echo -e "${GREEN}✅ PASSED${NC} - Logout successful"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Logout failed"
    ((FAILED++))
fi

# Test 10: Use refresh token after logout (should fail)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 10: Refresh Token After Logout (Should Fail)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
AFTER_LOGOUT=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}')
echo "Response: $AFTER_LOGOUT"
if echo "$AFTER_LOGOUT" | grep -q -E "Invalid refresh token|Session not found"; then
    echo -e "${GREEN}✅ PASSED${NC} - Logged out token correctly invalidated"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Logged out token still valid (security issue!)"
    ((FAILED++))
fi

# Test 11: Login with existing user (alice@example.com)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 11: Login with Existing Test User (Alice)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ALICE_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}')
echo "Response: ${ALICE_LOGIN:0:200}..."
if echo "$ALICE_LOGIN" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASSED${NC} - Existing user login successful"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Existing user login failed"
    ((FAILED++))
fi

# Stop the service
echo ""
echo "🛑 Stopping auth service..."
kill $SERVICE_PID 2>/dev/null
sleep 1

# Summary
echo ""
echo "==================================="
echo "📊 Test Summary"
echo "==================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total Tests: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    exit 1
fi
