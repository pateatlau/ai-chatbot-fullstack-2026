#!/bin/bash

# Phase 2 - Cross-Service GraphQL Federation Integration Tests
# Tests all 3 services (Auth, Chatbot, Admin) via GraphQL Gateway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_URL="http://localhost:3000/graphql"
CHATBOT_URL="http://localhost:3001/graphql"
ADMIN_URL="http://localhost:3002/graphql"
GATEWAY_URL="http://localhost:4000"

PASSED=0
FAILED=0
SKIPPED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

test_skipped() {
    echo -e "${YELLOW}⊘ $1${NC}"
    ((SKIPPED++))
}

check_service() {
    local service=$1
    local url=$2
    print_section "Checking $service availability"
    
    if curl -s -X POST "$url" \
        -H "Content-Type: application/json" \
        -d '{"query":"{health}"}' > /dev/null 2>&1; then
        test_passed "$service is responding"
        return 0
    else
        test_failed "$service is not responding on $url"
        return 1
    fi
}

# ============================================================================
# SERVICE HEALTH CHECKS
# ============================================================================

print_header "PHASE 2 - GRAPHQL FEDERATION INTEGRATION TESTS"

print_section "Service Availability Checks"
echo "Checking if all services are running..."
echo "Auth Service:    $AUTH_URL"
echo "Chatbot Service: $CHATBOT_URL"
echo "Admin Service:   $ADMIN_URL"
echo "Gateway:         $GATEWAY_URL"

# Check services
check_service "Auth Service" "$AUTH_URL" || {
    test_skipped "Cannot proceed without Auth Service"
}

check_service "Chatbot Service" "$CHATBOT_URL" || {
    test_skipped "Cannot proceed without Chatbot Service"
}

check_service "Admin Service" "$ADMIN_URL" || {
    test_skipped "Cannot proceed without Admin Service"
}

# ============================================================================
# SERVICE INTROSPECTION TESTS
# ============================================================================

print_section "Service Introspection & Schema Validation"

# Test Auth Service Schema
echo "Querying Auth Service schema..."
AUTH_SCHEMA=$(curl -s -X POST "$AUTH_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types | length')

if [ "$AUTH_SCHEMA" -gt 0 ]; then
    test_passed "Auth Service schema has $AUTH_SCHEMA types"
else
    test_failed "Auth Service schema is invalid"
fi

# Test Chatbot Service Schema
echo "Querying Chatbot Service schema..."
CHATBOT_SCHEMA=$(curl -s -X POST "$CHATBOT_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types | length')

if [ "$CHATBOT_SCHEMA" -gt 0 ]; then
    test_passed "Chatbot Service schema has $CHATBOT_SCHEMA types"
else
    test_failed "Chatbot Service schema is invalid"
fi

# Test Admin Service Schema
echo "Querying Admin Service schema..."
ADMIN_SCHEMA=$(curl -s -X POST "$ADMIN_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types | length')

if [ "$ADMIN_SCHEMA" -gt 0 ]; then
    test_passed "Admin Service schema has $ADMIN_SCHEMA types"
else
    test_failed "Admin Service schema is invalid"
fi

# ============================================================================
# GATEWAY FEDERATION TESTS
# ============================================================================

print_section "Gateway Federation Composition"

# Check gateway health
echo "Testing gateway /graphql endpoint..."
GATEWAY_RESPONSE=$(curl -s -X POST "$GATEWAY_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{__typename}"}')

if echo "$GATEWAY_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
    test_passed "Gateway is responding to GraphQL queries"
else
    test_failed "Gateway is not responding correctly"
    echo "Response: $GATEWAY_RESPONSE"
fi

# Check gateway schema composition
echo "Checking gateway schema for composed types..."
GATEWAY_SCHEMA=$(curl -s -X POST "$GATEWAY_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | jq '.data.__schema.types | map(.name) | @csv')

if echo "$GATEWAY_SCHEMA" | grep -qi "User"; then
    test_passed "Gateway has User type in schema"
else
    test_failed "Gateway missing User type from federation"
fi

if echo "$GATEWAY_SCHEMA" | grep -qi "Conversation"; then
    test_passed "Gateway has Conversation type (from Chatbot)"
else
    test_failed "Gateway missing Conversation type"
fi

if echo "$GATEWAY_SCHEMA" | grep -qi "Admin"; then
    test_passed "Gateway has Admin type (from Admin service)"
else
    test_failed "Gateway missing Admin type"
fi

# ============================================================================
# SERVICE QUERY TESTS
# ============================================================================

print_section "Service-Specific Queries"

# Auth Service - Health query
echo "Testing Auth Service health query..."
AUTH_HEALTH=$(curl -s -X POST "$AUTH_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}' | jq -r '.data.health')

if [ "$AUTH_HEALTH" = "Auth Service OK" ]; then
    test_passed "Auth Service health check returned: $AUTH_HEALTH"
else
    test_failed "Auth Service health query failed: $AUTH_HEALTH"
fi

# Chatbot Service - Health query
echo "Testing Chatbot Service health query..."
CHATBOT_HEALTH=$(curl -s -X POST "$CHATBOT_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}' | jq -r '.data.health')

if [ "$CHATBOT_HEALTH" = "Chatbot Subgraph OK" ]; then
    test_passed "Chatbot Service health check returned: $CHATBOT_HEALTH"
else
    test_failed "Chatbot Service health query failed: $CHATBOT_HEALTH"
fi

# Admin Service - Health query
echo "Testing Admin Service health query..."
ADMIN_HEALTH=$(curl -s -X POST "$ADMIN_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}' | jq -r '.data.health')

if [ "$ADMIN_HEALTH" = "Admin Subgraph OK" ]; then
    test_passed "Admin Service health check returned: $ADMIN_HEALTH"
else
    test_failed "Admin Service health query failed: $ADMIN_HEALTH"
fi

# ============================================================================
# FEDERATION REFERENCE TESTS
# ============================================================================

print_section "Federation Reference Resolution"

# Test User reference resolution through Chatbot Service
echo "Testing User type reference resolution..."
USER_QUERY=$(curl -s -X POST "$CHATBOT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"User\") { name fields { name } } }"
  }' | jq '.data.__type')

if echo "$USER_QUERY" | jq -e '.name == "User"' > /dev/null 2>&1; then
    test_passed "Chatbot Service can resolve User type extension"
else
    test_failed "Chatbot Service User type extension not working"
fi

# Test Admin reference resolution
echo "Testing Admin type existence..."
ADMIN_QUERY=$(curl -s -X POST "$ADMIN_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"Admin\") { name fields { name } } }"
  }' | jq '.data.__type')

if echo "$ADMIN_QUERY" | jq -e '.name == "Admin"' > /dev/null 2>&1; then
    test_passed "Admin Service has Admin type defined"
else
    test_failed "Admin Service Admin type not found"
fi

# ============================================================================
# AUTHORIZATION TESTS
# ============================================================================

print_section "Authorization & Error Handling"

# Test unauthenticated query (should work for health)
echo "Testing unauthenticated access to health query..."
UNAUTH_HEALTH=$(curl -s -X POST "$GATEWAY_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{health}"}' | jq '.data')

if [ "$UNAUTH_HEALTH" != "null" ]; then
    test_passed "Public health query accessible without authentication"
else
    test_failed "Health query requires authentication (unexpected)"
fi

# Test invalid GraphQL query error handling
echo "Testing error handling with invalid query..."
ERROR_RESPONSE=$(curl -s -X POST "$GATEWAY_URL" \
  -H "Content-Type: application/json" \
  -d '{"query":"{invalidQuery}"}' | jq '.errors | length')

if [ "$ERROR_RESPONSE" -gt 0 ]; then
    test_passed "Gateway returns proper GraphQL errors"
else
    test_failed "Gateway error handling not working"
fi

# ============================================================================
# CROSS-SERVICE RESOLUTION TESTS
# ============================================================================

print_section "Cross-Service Type Resolution"

# Test that gateway can resolve User across services
echo "Testing User type across services..."
CROSS_SERVICE_QUERY=$(curl -s -X POST "$GATEWAY_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __type(name: \"User\") { possibleTypes { name } } }"
  }')

if echo "$CROSS_SERVICE_QUERY" | jq -e '.data' > /dev/null 2>&1; then
    test_passed "Gateway can resolve User type definition"
else
    test_failed "Gateway cannot resolve User type"
fi

# ============================================================================
# RESULTS SUMMARY
# ============================================================================

print_header "TEST RESULTS SUMMARY"

TOTAL=$((PASSED + FAILED + SKIPPED))
SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))

echo -e "${GREEN}✅ Passed:  $PASSED${NC}"
echo -e "${RED}❌ Failed:  $FAILED${NC}"
echo -e "${YELLOW}⊘ Skipped: $SKIPPED${NC}"
echo -e "─────────────────"
echo -e "Total:   $TOTAL"
echo -e "\n${BLUE}Success Rate: ${SUCCESS_RATE}%${NC}\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 ALL TESTS PASSED - FEDERATION READY FOR INTEGRATION${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  SOME TESTS FAILED - CHECK SERVICE STATUS${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    exit 1
fi
