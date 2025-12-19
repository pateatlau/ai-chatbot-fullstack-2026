#!/bin/bash

# Comprehensive Login Flow Test
# Tests registration, login, and authentication after bug fixes

echo "================================================"
echo "🧪 COMPREHENSIVE LOGIN FLOW TEST"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test Results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test function
run_test() {
  local test_name=$1
  local test_command=$2
  local expected_pattern=$3
  
  TESTS_TOTAL=$((TESTS_TOTAL + 1))
  echo -e "${BLUE}[TEST $TESTS_TOTAL]${NC} $test_name"
  
  result=$(eval "$test_command" 2>&1)
  
  if echo "$result" | grep -q "$expected_pattern"; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$result" | head -20
  else
    echo -e "${RED}❌ FAIL${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "Expected pattern: $expected_pattern"
    echo "Got:"
    echo "$result"
  fi
  echo ""
}

# Generate unique test user
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_login_$TIMESTAMP@example.com"
TEST_PASSWORD="SecurePass123!"
TEST_NAME="Test User $TIMESTAMP"

echo -e "${YELLOW}📝 Test User Credentials:${NC}"
echo "Email: $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"
echo "Name: $TEST_NAME"
echo ""

# Clean up old cookies
rm -f /tmp/test_cookies.txt /tmp/test_register_cookies.txt /tmp/test_login_cookies.txt

echo "================================================"
echo "🔍 BACKEND HEALTH CHECKS"
echo "================================================"
echo ""

# Test 1: Auth Service Health
run_test "Auth Service Responding" \
  "curl -s -w '%{http_code}' http://localhost:3000/ -o /dev/null" \
  "200\|404"

# Test 2: Frontend Health
run_test "Shell Frontend Responding" \
  "curl -s -w '%{http_code}' http://localhost:5173/ -o /dev/null" \
  "200"

run_test "Auth MFE Responding" \
  "curl -s -w '%{http_code}' http://localhost:5174/ -o /dev/null" \
  "200"

echo "================================================"
echo "🔐 REGISTRATION FLOW (Auto-Login Test)"
echo "================================================"
echo ""

# Test 3: Registration with Auto-Login
echo -e "${BLUE}[TEST $((TESTS_TOTAL + 1))]${NC} Registration Returns LoginResponse with Tokens"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c /tmp/test_register_cookies.txt \
  -D /tmp/test_register_headers.txt \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_NAME\"
  }")

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"

# Check if response has user object
if echo "$REGISTER_RESPONSE" | grep -q '"user"'; then
  if echo "$REGISTER_RESPONSE" | grep -q '"id"'; then
    if echo "$REGISTER_RESPONSE" | grep -q '"email"'; then
      echo -e "${GREEN}✅ PASS - Response includes user object${NC}"
      TESTS_PASSED=$((TESTS_PASSED + 1))
      
      # Extract user ID for later tests
      USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id' 2>/dev/null)
      echo "User ID: $USER_ID"
    else
      echo -e "${RED}❌ FAIL - User object missing email${NC}"
      TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
  else
    echo -e "${RED}❌ FAIL - User object missing id${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}❌ FAIL - Response missing user object${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Registration Sets HttpOnly Cookies
echo -e "${BLUE}[TEST $((TESTS_TOTAL + 1))]${NC} Registration Sets HttpOnly Cookies"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

if [ -f /tmp/test_register_headers.txt ]; then
  echo "Response Headers:"
  cat /tmp/test_register_headers.txt | grep -i "set-cookie"
  
  if grep -qi "set-cookie.*accessToken" /tmp/test_register_headers.txt; then
    if grep -qi "set-cookie.*refreshToken" /tmp/test_register_headers.txt; then
      if grep -qi "httponly" /tmp/test_register_headers.txt; then
        echo -e "${GREEN}✅ PASS - Both tokens set with HttpOnly${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
      else
        echo -e "${RED}❌ FAIL - Cookies not HttpOnly${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
      fi
    else
      echo -e "${RED}❌ FAIL - Missing refreshToken cookie${NC}"
      TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
  else
    echo -e "${RED}❌ FAIL - Missing accessToken cookie${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}❌ FAIL - No headers file created${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Verify Token Works (Authenticated Request)
echo -e "${BLUE}[TEST $((TESTS_TOTAL + 1))]${NC} Tokens Work for Authenticated Requests"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

ME_RESPONSE=$(curl -s http://localhost:3000/api/auth/me \
  -b /tmp/test_register_cookies.txt)

echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"

if echo "$ME_RESPONSE" | grep -q "\"id\".*\"$USER_ID\""; then
  echo -e "${GREEN}✅ PASS - /me endpoint returns correct user${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ FAIL - /me endpoint failed or wrong user${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

echo "================================================"
echo "🔑 LOGIN FLOW TEST"
echo "================================================"
echo ""

# Test 6: Login with Credentials
echo -e "${BLUE}[TEST $((TESTS_TOTAL + 1))]${NC} Login Returns User with Optional Fields"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c /tmp/test_login_cookies.txt \
  -D /tmp/test_login_headers.txt \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Check for user object with optional fields
if echo "$LOGIN_RESPONSE" | grep -q '"user"'; then
  HAS_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id' 2>/dev/null)
  HAS_EMAIL=$(echo "$LOGIN_RESPONSE" | jq -r '.user.email' 2>/dev/null)
  HAS_NAME=$(echo "$LOGIN_RESPONSE" | jq -r '.user.name' 2>/dev/null)
  HAS_ROLE=$(echo "$LOGIN_RESPONSE" | jq -r '.user.role' 2>/dev/null)
  
  if [ "$HAS_ID" != "null" ] && [ "$HAS_EMAIL" != "null" ] && [ "$HAS_NAME" != "null" ] && [ "$HAS_ROLE" != "null" ]; then
    echo -e "${GREEN}✅ PASS - Login returns complete user object${NC}"
    echo "Fields present: id, email, name, role"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ FAIL - Missing required fields${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}❌ FAIL - No user object in login response${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 7: Login Sets Cookies
echo -e "${BLUE}[TEST $((TESTS_TOTAL + 1))]${NC} Login Sets HttpOnly Cookies"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

if grep -qi "set-cookie.*accessToken.*httponly" /tmp/test_login_headers.txt; then
  if grep -qi "set-cookie.*refreshToken.*httponly" /tmp/test_login_headers.txt; then
    echo -e "${GREEN}✅ PASS - Login sets HttpOnly cookies${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ FAIL - Missing refreshToken${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}❌ FAIL - Missing accessToken${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

echo "================================================"
echo "📊 TEST SUMMARY"
echo "================================================"
echo ""
echo -e "Total Tests: ${BLUE}$TESTS_TOTAL${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo ""
  echo "✅ Registration auto-login working"
  echo "✅ HttpOnly cookies set correctly"
  echo "✅ Login flow working"
  echo "✅ Token validation working"
  echo ""
  echo -e "${YELLOW}Ready for manual browser testing!${NC}"
  echo ""
  echo "Test in browser:"
  echo "1. Navigate to http://localhost:5173/register"
  echo "2. Register with test credentials"
  echo "3. Verify auto-redirect to dashboard"
  echo "4. Refresh page - should stay logged in"
  echo "5. Logout and login again"
  exit 0
else
  echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
  echo ""
  echo "Please review the failures above before manual testing."
  exit 1
fi
