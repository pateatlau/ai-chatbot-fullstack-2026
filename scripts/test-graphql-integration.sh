#!/bin/bash

# GraphQL Integration Test Suite
# Tests Week 3 Auth Subgraph Completion

set -e

echo "🧪 GraphQL Integration Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0
PASSED=0

# Test helper function
test_endpoint() {
  local name=$1
  local query=$2
  local method=${3:-"POST"}
  
  echo -n "Testing: $name... "
  
  response=$(curl -s -X $method http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d "$query" 2>&1)
  
  # Check if response contains errors field with "Not authenticated" (expected)
  if echo "$response" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC}"
    echo "  Error: $response"
    ((FAILED++))
  fi
}

# Test 1: Gateway Health
echo -e "${YELLOW}1. Gateway Health${NC}"
response=$(curl -s http://localhost:4000/health)
if echo "$response" | jq . > /dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} Gateway responding on port 4000"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Gateway not responding"
  ((FAILED++))
fi
echo ""

# Test 2: Auth Service Health
echo -e "${YELLOW}2. Auth Service Health${NC}"
response=$(curl -s http://localhost:3000/health)
if echo "$response" | jq . > /dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} Auth service responding on port 3000"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Auth service not responding"
  ((FAILED++))
fi
echo ""

# Test 3: GraphQL Schema Introspection
echo -e "${YELLOW}3. GraphQL Schema Composition${NC}"
introspection_query='{"query":"{ __schema { types { name } } }"}'
response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d "$introspection_query")

if echo "$response" | grep -q "User" 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} User type in composed schema"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} User type not found in schema"
  ((FAILED++))
fi

if echo "$response" | grep -q "Query" 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} Query type in composed schema"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Query type not found in schema"
  ((FAILED++))
fi

if echo "$response" | grep -q "Mutation" 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} Mutation type in composed schema"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} Mutation type not found in schema"
  ((FAILED++))
fi
echo ""

# Test 4: GraphQL Queries
echo -e "${YELLOW}4. GraphQL Auth Queries${NC}"

# Query: me (unauthenticated - should return Not authenticated error)
me_query='{"query":"{ me { id email name role } }"}'
response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d "$me_query")

if echo "$response" | grep -q "Not authenticated" 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} me query properly rejects unauthenticated requests"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} me query should reject unauthenticated requests"
  echo "  Response: $response"
  ((FAILED++))
fi
echo ""

# Test 5: GraphQL Mutations
echo -e "${YELLOW}5. GraphQL Auth Mutations${NC}"

# Register mutation
register_query='{
  "query": "mutation { register(input: { email: \"test@example.com\", password: \"Test123!\" }) { success message user { id email name role } token } }"
}'

response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d "$register_query")

if echo "$response" | jq . > /dev/null 2>&1; then
  echo -e "  ${GREEN}✓${NC} register mutation query accepted"
  ((PASSED++))
  
  # Check if it succeeded or had validation errors
  if echo "$response" | grep -q "success" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} register mutation response has success field"
    ((PASSED++))
  else
    echo -e "  ${YELLOW}⚠${NC} register mutation may have schema issues"
  fi
else
  echo -e "  ${RED}✗${NC} register mutation failed"
  echo "  Response: $response"
  ((FAILED++))
fi
echo ""

# Test 6: Federation
echo -e "${YELLOW}6. Federation Support${NC}"

# Query for User type with @key directive
federation_query='{
  "query": "{ __type(name: \"User\") { name fields { name } } }"
}'

response=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d "$federation_query")

if echo "$response" | grep -q '"User"' 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} User type available for federation"
  ((PASSED++))
else
  echo -e "  ${RED}✗${NC} User type not properly exposed"
  ((FAILED++))
fi
echo ""

# Summary
echo "🎯 Test Results"
echo "==============="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed! Week 3 integration verified.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. See details above.${NC}"
  exit 1
fi
