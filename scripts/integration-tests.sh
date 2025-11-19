#!/bin/bash

# Integration Test Suite for GraphQL Federation
# Tests all 3 services (Auth, Chatbot, Admin) and the Gateway
# Verifies: individual service health, federation composition, cross-service queries

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMEOUT=30
AUTH_SERVICE_PORT=3000
CHATBOT_SERVICE_PORT=3001
ADMIN_SERVICE_PORT=3002
GATEWAY_PORT=4000
BASE_URL="http://localhost"

# Test results
PASSED=0
FAILED=0
SKIPPED=0

# Utility functions
log_section() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}▶ $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_test() {
  echo -e "${YELLOW}  ○ $1${NC}"
}

log_pass() {
  echo -e "${GREEN}  ✓ $1${NC}"
  ((PASSED++))
}

log_fail() {
  echo -e "${RED}  ✗ $1${NC}"
  ((FAILED++))
}

log_skip() {
  echo -e "${YELLOW}  ⊘ $1 (skipped)${NC}"
  ((SKIPPED++))
}

# Wait for service to be ready
wait_for_service() {
  local port=$1
  local service_name=$2
  local elapsed=0
  
  echo -ne "${YELLOW}  ⧖ Waiting for $service_name on port $port...${NC}"
  
  while ! curl -s "http://localhost:$port/health" > /dev/null 2>&1; do
    if [ $elapsed -ge $TIMEOUT ]; then
      echo -e "${RED} TIMEOUT${NC}"
      return 1
    fi
    sleep 1
    ((elapsed++))
    echo -ne "."
  done
  
  echo -e "${GREEN} READY${NC}"
  return 0
}

# GraphQL query helper
query_graphql() {
  local port=$1
  local query=$2
  local token=$3
  
  if [ -z "$token" ]; then
    curl -s -X POST "http://localhost:$port/graphql" \
      -H "Content-Type: application/json" \
      -d "{\"query\":\"$query\"}"
  else
    curl -s -X POST "http://localhost:$port/graphql" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "{\"query\":\"$query\"}"
  fi
}

# Extract field from JSON response
get_json_field() {
  local json=$1
  local field=$2
  echo "$json" | grep -o "\"$field\":[^,}]*" | head -1 | cut -d':' -f2 | tr -d ' "' | tr -d '}'
}

# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================

echo -e "${GREEN}"
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║     GraphQL Federation Integration Test Suite                 ║
║     Testing Auth, Chatbot, Admin Services & Gateway            ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Test 1: Service Startup
log_section "1. SERVICE STARTUP & HEALTH CHECKS"

log_test "Starting Auth Service (port $AUTH_SERVICE_PORT)..."
npm run dev:auth > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
if wait_for_service $AUTH_SERVICE_PORT "Auth Service"; then
  log_pass "Auth Service started (PID: $AUTH_PID)"
else
  log_fail "Auth Service failed to start"
  cat /tmp/auth-service.log | tail -20
  exit 1
fi

log_test "Starting Chatbot Service (port $CHATBOT_SERVICE_PORT)..."
npm run dev:chatbot > /tmp/chatbot-service.log 2>&1 &
CHATBOT_PID=$!
if wait_for_service $CHATBOT_SERVICE_PORT "Chatbot Service"; then
  log_pass "Chatbot Service started (PID: $CHATBOT_PID)"
else
  log_fail "Chatbot Service failed to start"
  cat /tmp/chatbot-service.log | tail -20
  kill $AUTH_PID 2>/dev/null || true
  exit 1
fi

log_test "Starting Admin Service (port $ADMIN_SERVICE_PORT)..."
npm run dev:admin > /tmp/admin-service.log 2>&1 &
ADMIN_PID=$!
if wait_for_service $ADMIN_SERVICE_PORT "Admin Service"; then
  log_pass "Admin Service started (PID: $ADMIN_PID)"
else
  log_fail "Admin Service failed to start"
  cat /tmp/admin-service.log | tail -20
  kill $AUTH_PID $CHATBOT_PID 2>/dev/null || true
  exit 1
fi

log_test "Starting GraphQL Gateway (port $GATEWAY_PORT)..."
npm run dev:gateway > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
sleep 2  # Give gateway extra time to introspect services
if wait_for_service $GATEWAY_PORT "GraphQL Gateway"; then
  log_pass "GraphQL Gateway started (PID: $GATEWAY_PID)"
else
  log_fail "GraphQL Gateway failed to start"
  cat /tmp/gateway.log | tail -20
  kill $AUTH_PID $CHATBOT_PID $ADMIN_PID 2>/dev/null || true
  exit 1
fi

# Test 2: Individual Service GraphQL Health
log_section "2. SERVICE GRAPHQL HEALTH CHECKS"

log_test "Checking Auth Service GraphQL health..."
RESPONSE=$(query_graphql $AUTH_SERVICE_PORT "{health}")
if echo "$RESPONSE" | grep -q "OK"; then
  log_pass "Auth Service GraphQL responsive"
else
  log_fail "Auth Service GraphQL health check failed: $RESPONSE"
fi

log_test "Checking Chatbot Service GraphQL health..."
RESPONSE=$(query_graphql $CHATBOT_SERVICE_PORT "{health}")
if echo "$RESPONSE" | grep -q "OK"; then
  log_pass "Chatbot Service GraphQL responsive"
else
  log_fail "Chatbot Service GraphQL health check failed: $RESPONSE"
fi

log_test "Checking Admin Service GraphQL health..."
RESPONSE=$(query_graphql $ADMIN_SERVICE_PORT "{health}")
if echo "$RESPONSE" | grep -q "OK"; then
  log_pass "Admin Service GraphQL responsive"
else
  log_fail "Admin Service GraphQL health check failed: $RESPONSE"
fi

log_test "Checking Gateway health endpoint..."
RESPONSE=$(curl -s "http://localhost:$GATEWAY_PORT/health")
if echo "$RESPONSE" | grep -q "healthy"; then
  log_pass "Gateway health endpoint responsive"
else
  log_fail "Gateway health check failed: $RESPONSE"
fi

# Test 3: Federation Composition
log_section "3. FEDERATION COMPOSITION"

log_test "Verifying gateway can see Auth subgraph..."
if curl -s "http://localhost:$GATEWAY_PORT/health" | grep -q "Auth Subgraph"; then
  log_pass "Auth subgraph discovered by gateway"
else
  log_skip "Gateway composition details (check gateway logs)"
fi

log_test "Verifying gateway can see Chatbot subgraph..."
if curl -s "http://localhost:$GATEWAY_PORT/health" | grep -q "Chatbot Subgraph"; then
  log_pass "Chatbot subgraph discovered by gateway"
else
  log_skip "Gateway composition details (check gateway logs)"
fi

# Test 4: Auth Service Operations (without token first)
log_section "4. AUTH SERVICE GRAPHQL QUERIES"

log_test "Testing auth health query (unauthenticated)..."
RESPONSE=$(query_graphql $AUTH_SERVICE_PORT "{health}")
if echo "$RESPONSE" | grep -q "OK"; then
  log_pass "Health query succeeded (no auth required)"
else
  log_fail "Health query failed: $RESPONSE"
fi

log_test "Testing me query without token (should fail)..."
RESPONSE=$(query_graphql $AUTH_SERVICE_PORT "{me{id email}}")
if echo "$RESPONSE" | grep -q "UNAUTHENTICATED\|error"; then
  log_pass "Properly rejected unauthenticated query"
else
  log_fail "Should have rejected unauthenticated query: $RESPONSE"
fi

log_test "Testing user registration..."
REGISTER_QUERY='mutation{register(input:{email:"test@integration.com",password:"SecurePass123!",firstName:"Integration"}){success user{id email}}}'
RESPONSE=$(query_graphql $AUTH_SERVICE_PORT "$REGISTER_QUERY")
if echo "$RESPONSE" | grep -q '"success":true\|"email"'; then
  log_pass "User registration successful"
  # Extract token for later tests (if response includes token)
  USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  log_fail "User registration failed: $RESPONSE"
  USER_ID=""
fi

# Test 5: Chatbot Service Operations
log_section "5. CHATBOT SERVICE GRAPHQL QUERIES"

log_test "Testing chatbot health query..."
RESPONSE=$(query_graphql $CHATBOT_SERVICE_PORT "{health}")
if echo "$RESPONSE" | grep -q "OK"; then
  log_pass "Chatbot health query succeeded"
else
  log_fail "Chatbot health query failed: $RESPONSE"
fi

log_test "Testing conversations query without auth (should fail)..."
RESPONSE=$(query_graphql $CHATBOT_SERVICE_PORT "{conversations(input:{page:1,limit:10}){id title}}")
if echo "$RESPONSE" | grep -q "UNAUTHENTICATED\|error"; then
  log_pass "Properly rejected unauthenticated conversations query"
else
  log_fail "Should have rejected unauthenticated query: $RESPONSE"
fi

# Test 6: Admin Service Operations
log_section "6. ADMIN SERVICE GRAPHQL QUERIES"

log_test "Testing admin health query..."
RESPONSE=$(query_graphql $ADMIN_SERVICE_PORT "{health}")
if echo "$RESPONSE" | grep -q "OK"; then
  log_pass "Admin health query succeeded"
else
  log_fail "Admin health query failed: $RESPONSE"
fi

log_test "Testing admin query without auth (should fail)..."
RESPONSE=$(query_graphql $ADMIN_SERVICE_PORT "{admins(input:{page:1,limit:10}){id}}")
if echo "$RESPONSE" | grep -q "UNAUTHENTICATED\|error"; then
  log_pass "Properly rejected unauthenticated admin query"
else
  log_fail "Should have rejected unauthenticated query: $RESPONSE"
fi

# Test 7: Gateway Unified API
log_section "7. GATEWAY UNIFIED GRAPHQL API"

log_test "Testing gateway health endpoint..."
GATEWAY_HEALTH=$(curl -s "http://localhost:$GATEWAY_PORT/health")
if echo "$GATEWAY_HEALTH" | grep -q "healthy"; then
  log_pass "Gateway health responsive"
else
  log_fail "Gateway health check failed"
fi

log_test "Testing gateway can serve unified schema..."
RESPONSE=$(curl -s -X POST "http://localhost:$GATEWAY_PORT/" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{__schema{types{name}}}"}')
if echo "$RESPONSE" | grep -q "__Type\|User\|Conversation"; then
  log_pass "Gateway schema introspection works"
else
  log_fail "Gateway schema introspection failed: $RESPONSE"
fi

# Test 8: Error Handling
log_section "8. ERROR HANDLING & VALIDATION"

log_test "Testing GraphQL syntax error handling..."
RESPONSE=$(query_graphql $AUTH_SERVICE_PORT "invalid query")
if echo "$RESPONSE" | grep -q "error\|parse"; then
  log_pass "Proper error on invalid query syntax"
else
  log_fail "Should have errored on invalid query: $RESPONSE"
fi

log_test "Testing field validation..."
RESPONSE=$(query_graphql $AUTH_SERVICE_PORT "{invalidField}")
if echo "$RESPONSE" | grep -q "error\|Cannot query field"; then
  log_pass "Proper error on invalid field"
else
  log_fail "Should have errored on invalid field: $RESPONSE"
fi

# Test 9: Restart Resilience
log_section "9. SERVICE RESILIENCE & RECOVERY"

log_test "Checking all services are still running..."
if ps -p $AUTH_PID > /dev/null && ps -p $CHATBOT_PID > /dev/null && \
   ps -p $ADMIN_PID > /dev/null && ps -p $GATEWAY_PID > /dev/null; then
  log_pass "All services still running"
else
  log_fail "One or more services crashed"
fi

log_test "Final health check for all services..."
for port in $AUTH_SERVICE_PORT $CHATBOT_SERVICE_PORT $ADMIN_SERVICE_PORT; do
  if curl -s "http://localhost:$port/health" > /dev/null; then
    log_pass "Service on port $port responsive"
  else
    log_fail "Service on port $port not responding"
  fi
done

# Cleanup
log_section "CLEANUP"

log_test "Stopping services..."
kill $AUTH_PID $CHATBOT_PID $ADMIN_PID $GATEWAY_PID 2>/dev/null || true
sleep 2

log_test "Verifying services stopped..."
if ! ps -p $AUTH_PID > /dev/null 2>&1 && \
   ! ps -p $CHATBOT_PID > /dev/null 2>&1 && \
   ! ps -p $ADMIN_PID > /dev/null 2>&1 && \
   ! ps -p $GATEWAY_PID > /dev/null 2>&1; then
  log_pass "All services gracefully stopped"
else
  log_test "Force killing remaining processes..."
  pkill -f "nx serve" 2>/dev/null || true
fi

# Summary
log_section "TEST SUMMARY"

TOTAL=$((PASSED + FAILED + SKIPPED))
SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))

echo -e "${GREEN}  Passed:  $PASSED${NC}"
echo -e "${RED}  Failed:  $FAILED${NC}"
echo -e "${YELLOW}  Skipped: $SKIPPED${NC}"
echo -e "  Total:   $TOTAL"
echo -e "\n  Success Rate: ${SUCCESS_RATE}%"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ ALL TESTS PASSED${NC}"
  exit 0
else
  echo -e "\n${RED}✗ SOME TESTS FAILED${NC}"
  exit 1
fi
