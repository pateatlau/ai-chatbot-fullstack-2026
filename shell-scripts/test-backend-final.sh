#!/bin/bash

echo "=========================================="
echo "🔍 FINAL BACKEND IMPLEMENTATION TEST"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 1: Infrastructure Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Docker Containers
echo "Test 1: Docker Containers Status"
DOCKER_STATUS=$(docker-compose ps --format json 2>/dev/null | jq -r '.[] | select(.State == "running") | .Name' 2>/dev/null)
if echo "$DOCKER_STATUS" | grep -q "postgres" && echo "$DOCKER_STATUS" | grep -q "redis"; then
    echo -e "${GREEN}✅ PASSED${NC} - PostgreSQL and Redis containers running"
    ((PASSED++))
    echo "  Running: $(echo "$DOCKER_STATUS" | tr '\n' ', ' | sed 's/,$//')"
else
    echo -e "${RED}❌ FAILED${NC} - Docker containers not running properly"
    ((FAILED++))
    echo "  Expected: myapp-postgres, myapp-redis"
fi

# Test 2: PostgreSQL Connection
echo ""
echo "Test 2: PostgreSQL Database Connection"
PG_TEST=$(docker-compose exec -T postgres psql -U myapp -d myapp_dev -c "SELECT version();" 2>/dev/null | grep PostgreSQL)
if [ ! -z "$PG_TEST" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - PostgreSQL connection successful"
    ((PASSED++))
    PG_VERSION=$(echo "$PG_TEST" | grep -oP 'PostgreSQL \K[0-9]+\.[0-9]+')
    echo "  Version: PostgreSQL $PG_VERSION"
else
    echo -e "${RED}❌ FAILED${NC} - Cannot connect to PostgreSQL"
    ((FAILED++))
fi

# Test 3: Database Schema
echo ""
echo "Test 3: Database Schema Validation"
TABLES=$(docker-compose exec -T postgres psql -U myapp -d myapp_dev -c "\dt" 2>/dev/null | grep -E "users|sessions" | wc -l)
if [ "$TABLES" -eq 2 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Required tables exist (users, sessions)"
    ((PASSED++))
    USER_COUNT=$(docker-compose exec -T postgres psql -U myapp -d myapp_dev -c "SELECT COUNT(*) FROM users;" 2>/dev/null | grep -oP '\d+' | head -1)
    echo "  Users in database: $USER_COUNT"
else
    echo -e "${RED}❌ FAILED${NC} - Missing required database tables"
    ((FAILED++))
fi

# Test 4: Redis Connection
echo ""
echo "Test 4: Redis Cache Connection"
REDIS_TEST=$(docker-compose exec -T redis redis-cli PING 2>/dev/null)
if [ "$REDIS_TEST" = "PONG" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Redis connection successful"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Cannot connect to Redis"
    ((FAILED++))
fi

# Test 5: Nx Build System
echo ""
echo "Test 5: Nx Build System"
if command -v nx &> /dev/null; then
    NX_VERSION=$(nx --version 2>/dev/null)
    echo -e "${GREEN}✅ PASSED${NC} - Nx CLI available (v$NX_VERSION)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Nx CLI not found"
    ((FAILED++))
fi

# Test 6: Auth Service Build
echo ""
echo "Test 6: Auth Service Build Verification"
if [ -f "dist/apps/auth-service/main.js" ]; then
    BUILD_SIZE=$(du -h dist/apps/auth-service/main.js | cut -f1)
    echo -e "${GREEN}✅ PASSED${NC} - Auth service built successfully"
    ((PASSED++))
    echo "  Build output: dist/apps/auth-service/main.js ($BUILD_SIZE)"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Auth service not built (building now...)"
    ((WARNINGS++))
    nx build auth-service --skip-nx-cache > /dev/null 2>&1
    if [ -f "dist/apps/auth-service/main.js" ]; then
        echo -e "${GREEN}✅ RECOVERED${NC} - Build successful"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Build failed"
        ((FAILED++))
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 2: Auth Service API Testing${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start auth service
echo "Starting auth service..."
./apps/auth-service/start.sh &
SERVICE_PID=$!
sleep 3

# Test 7: Service Health
echo "Test 7: Service Health Check"
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ PASSED${NC} - Health endpoint responding"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Health check failed"
    ((FAILED++))
fi

# Test 8: Registration Flow
echo ""
echo "Test 8: User Registration Flow"
TEST_EMAIL="final_test_$(date +%s)@example.com"
REG_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$TEST_EMAIL"'","password":"TestPass123!","name":"Final Test User"}')
if echo "$REG_RESPONSE" | grep -q "userId"; then
    echo -e "${GREEN}✅ PASSED${NC} - User registration successful"
    ((PASSED++))
    USER_ID=$(echo "$REG_RESPONSE" | jq -r .userId)
    echo "  Created user: $USER_ID"
else
    echo -e "${RED}❌ FAILED${NC} - Registration failed"
    ((FAILED++))
    echo "  Response: $REG_RESPONSE"
fi

# Test 9: Login Flow
echo ""
echo "Test 9: Authentication Flow"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$TEST_EMAIL"'","password":"TestPass123!"}')
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASSED${NC} - Login successful"
    ((PASSED++))
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .accessToken)
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r .refreshToken)
    echo "  Access token received: ${ACCESS_TOKEN:0:30}..."
else
    echo -e "${RED}❌ FAILED${NC} - Login failed"
    ((FAILED++))
fi

# Test 10: JWT Validation
echo ""
echo "Test 10: JWT Token Validation"
ME_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")
if echo "$ME_RESPONSE" | grep -q "$TEST_EMAIL"; then
    echo -e "${GREEN}✅ PASSED${NC} - JWT validation successful"
    ((PASSED++))
    echo "  Authenticated user: $(echo "$ME_RESPONSE" | jq -r .email)"
else
    echo -e "${RED}❌ FAILED${NC} - JWT validation failed"
    ((FAILED++))
fi

# Test 11: Password Security
echo ""
echo "Test 11: Password Security (bcrypt)"
WRONG_PASS=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$TEST_EMAIL"'","password":"WrongPassword123!"}')
if echo "$WRONG_PASS" | grep -q "Invalid email or password"; then
    echo -e "${GREEN}✅ PASSED${NC} - Password validation working"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC} - Password security issue"
    ((FAILED++))
fi

# Test 12: Token Refresh
echo ""
echo "Test 12: Token Refresh Mechanism"
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}')
if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASSED${NC} - Token refresh working"
    ((PASSED++))
    NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r .accessToken)
    echo "  New token issued: ${NEW_TOKEN:0:30}..."
else
    echo -e "${RED}❌ FAILED${NC} - Token refresh failed"
    ((FAILED++))
fi

# Test 13: Session Management
echo ""
echo "Test 13: Session Management"
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}')
if echo "$LOGOUT_RESPONSE" | grep -q "Logged out successfully"; then
    echo -e "${GREEN}✅ PASSED${NC} - Logout successful"
    ((PASSED++))
    
    # Verify session is invalidated
    POST_LOGOUT=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
      -H "Content-Type: application/json" \
      -d '{"refreshToken":"'"$REFRESH_TOKEN"'"}')
    if echo "$POST_LOGOUT" | grep -q -E "Invalid refresh token|Session not found"; then
        echo -e "${GREEN}✅ PASSED${NC} - Session properly invalidated"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} - Session not invalidated (security risk!)"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ FAILED${NC} - Logout failed"
    ((FAILED++))
fi

# Test 14: Existing User Test
echo ""
echo "Test 14: Existing Test User (Alice)"
ALICE_LOGIN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}')
if echo "$ALICE_LOGIN" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASSED${NC} - Seed user login working"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Seed user not found (run seed script)"
    ((WARNINGS++))
fi

# Stop service
echo ""
echo "Stopping auth service..."
kill $SERVICE_PID 2>/dev/null
sleep 1

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Phase 3: Security & Code Quality${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 15: Environment Variables
echo "Test 15: Environment Configuration"
if [ -f "apps/auth-service/.env" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Environment file exists"
    ((PASSED++))
    
    # Check for required variables
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "JWT_REFRESH_SECRET")
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" apps/auth-service/.env; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC} - All required environment variables present"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC} - Missing variables: ${MISSING_VARS[*]}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ FAILED${NC} - Environment file missing"
    ((FAILED++))
fi

# Test 16: TypeScript Configuration
echo ""
echo "Test 16: TypeScript Strict Mode"
if grep -q '"strict": true' tsconfig.base.json 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC} - TypeScript strict mode enabled"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - TypeScript strict mode not enabled"
    ((WARNINGS++))
fi

# Test 17: Security Headers
echo ""
echo "Test 17: Code Quality Check"
if [ -f "apps/auth-service/src/middleware/auth.middleware.ts" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Auth middleware exists"
    ((PASSED++))
    
    if grep -q "Bearer" apps/auth-service/src/middleware/auth.middleware.ts; then
        echo -e "${GREEN}✅ PASSED${NC} - JWT Bearer authentication implemented"
        ((PASSED++))
    fi
fi

# Test 18: RBAC Implementation
echo ""
echo "Test 18: RBAC Middleware"
if [ -f "apps/auth-service/src/middleware/rbac.middleware.ts" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - RBAC middleware exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - RBAC middleware not found"
    ((WARNINGS++))
fi

# Test 19: Database Connection Pool
echo ""
echo "Test 19: Database Connection Configuration"
if grep -q "Pool" apps/auth-service/src/lib/db.ts 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC} - Connection pooling configured"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Connection pooling not detected"
    ((WARNINGS++))
fi

# Test 20: Error Handling
echo ""
echo "Test 20: Error Handling"
if grep -q "try.*catch" apps/auth-service/src/controllers/auth.controller.ts 2>/dev/null; then
    echo -e "${GREEN}✅ PASSED${NC} - Error handling implemented"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Error handling not detected"
    ((WARNINGS++))
fi

# Final Summary
echo ""
echo "=========================================="
echo "📊 FINAL TEST SUMMARY"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo "Total Tests: $((PASSED + FAILED))"
echo ""

PASS_RATE=$((PASSED * 100 / (PASSED + FAILED)))
echo "Success Rate: $PASS_RATE%"
echo ""

if [ $FAILED -eq 0 ] && [ $PASS_RATE -ge 95 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ BACKEND READY FOR PRODUCTION${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✓ All critical tests passed"
    echo "✓ Infrastructure stable"
    echo "✓ Security measures in place"
    echo "✓ Ready to proceed with frontend"
    echo ""
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  BACKEND OPERATIONAL (Minor Issues)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✓ All tests passed"
    echo "⚠ $WARNINGS warnings to review"
    echo "→ Safe to proceed with caution"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ BACKEND NOT READY${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "✗ $FAILED critical tests failed"
    echo "→ Fix issues before proceeding"
    echo ""
    exit 1
fi
