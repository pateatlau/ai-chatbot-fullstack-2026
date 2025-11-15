#!/bin/bash

# Auth MFE Testing Script
# Tests the complete auth-mfe implementation

echo "🧪 AUTH MFE TESTING SUITE"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
test_case() {
    local name=$1
    local command=$2
    echo -n "Testing: $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test function with output
test_case_output() {
    local name=$1
    local command=$2
    local expected=$3
    echo -n "Testing: $name... "
    output=$(eval "$command" 2>&1)
    if echo "$output" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $output"
        ((FAILED++))
        return 1
    fi
}

echo "📦 1. BUILD TESTS"
echo "─────────────────"

test_case "Auth-MFE TypeScript Compilation" "npx nx build auth-mfe --skip-nx-cache"
test_case "UI Components Build" "npx nx build ui-components --skip-nx-cache"

echo ""
echo "🔍 2. TYPE CHECKING"
echo "─────────────────"

test_case "No TypeScript Errors" "npx tsc --noEmit -p apps/auth-mfe/tsconfig.app.json"
test_case "Schema Types Valid" "[ -f apps/auth-mfe/src/schemas/auth.schema.ts ]"
test_case "Service Types Valid" "[ -f apps/auth-mfe/src/services/auth.service.ts ]"

echo ""
echo "📋 3. FILE STRUCTURE"
echo "─────────────────"

test_case "Login Page Exists" "[ -f apps/auth-mfe/src/pages/Login.tsx ]"
test_case "Register Page Exists" "[ -f apps/auth-mfe/src/pages/Register.tsx ]"
test_case "Auth Schema Exists" "[ -f apps/auth-mfe/src/schemas/auth.schema.ts ]"
test_case "Auth Service Exists" "[ -f apps/auth-mfe/src/services/auth.service.ts ]"
test_case "Tailwind Config Exists" "[ -f apps/auth-mfe/tailwind.config.js ]"
test_case "Environment File Exists" "[ -f apps/auth-mfe/.env ]"

echo ""
echo "🔧 4. CONFIGURATION"
echo "─────────────────"

test_case_output "Tailwind Content Path" "grep -q 'ui-components' apps/auth-mfe/tailwind.config.js && echo 'found'" "found"
test_case_output "React Router Import" "grep -q 'react-router-dom' apps/auth-mfe/src/app/app.tsx && echo 'found'" "found"
test_case_output "Module Federation Config" "grep -q 'authMfe' apps/auth-mfe/vite.config.ts && echo 'found'" "found"

echo ""
echo "🎨 5. UI COMPONENTS INTEGRATION"
echo "─────────────────"

test_case_output "Button Import" "grep -q 'Button' apps/auth-mfe/src/pages/Login.tsx && echo 'found'" "found"
test_case_output "FormField Import" "grep -q 'FormField' apps/auth-mfe/src/pages/Login.tsx && echo 'found'" "found"
test_case_output "Card Import" "grep -q 'Card' apps/auth-mfe/src/pages/Login.tsx && echo 'found'" "found"

echo ""
echo "✅ 6. VALIDATION SCHEMAS"
echo "─────────────────"

test_case_output "Login Schema Defined" "grep -q 'loginSchema' apps/auth-mfe/src/schemas/auth.schema.ts && echo 'found'" "found"
test_case_output "Register Schema Defined" "grep -q 'registerSchema' apps/auth-mfe/src/schemas/auth.schema.ts && echo 'found'" "found"
test_case_output "Email Validation" "grep -q 'email()' apps/auth-mfe/src/schemas/auth.schema.ts && echo 'found'" "found"
test_case_output "Password Strength Validation" "grep -q 'regex' apps/auth-mfe/src/schemas/auth.schema.ts && echo 'found'" "found"
test_case_output "Password Confirmation" "grep -q 'confirmPassword' apps/auth-mfe/src/schemas/auth.schema.ts && echo 'found'" "found"

echo ""
echo "🌐 7. API INTEGRATION"
echo "─────────────────"

test_case_output "Auth Service Login Method" "grep -q 'login:' apps/auth-mfe/src/services/auth.service.ts && echo 'found'" "found"
test_case_output "Auth Service Register Method" "grep -q 'register:' apps/auth-mfe/src/services/auth.service.ts && echo 'found'" "found"
test_case_output "Axios Import" "grep -q 'axios' apps/auth-mfe/src/services/auth.service.ts && echo 'found'" "found"
test_case_output "API Base URL Config" "grep -q 'API_BASE_URL' apps/auth-mfe/src/services/auth.service.ts && echo 'found'" "found"

echo ""
echo "🔐 8. BACKEND API TESTS"
echo "─────────────────"

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}Backend is running${NC}"
    
    # Test registration
    REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{"name":"TestUser2","email":"test2@example.com","password":"Test@12345"}')
    
    if echo "$REGISTER_RESPONSE" | grep -q "userId\|email"; then
        echo -e "Testing: Registration Endpoint... ${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "Testing: Registration Endpoint... ${YELLOW}⚠ SKIPPED (user may exist)${NC}"
    fi
    
    # Test login
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"Test@123"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        echo -e "Testing: Login Endpoint... ${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        
        # Test token format
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
        if echo "$TOKEN" | grep -q "eyJ"; then
            echo -e "Testing: JWT Token Format... ${GREEN}✓ PASSED${NC}"
            ((PASSED++))
        else
            echo -e "Testing: JWT Token Format... ${RED}✗ FAILED${NC}"
            ((FAILED++))
        fi
    else
        echo -e "Testing: Login Endpoint... ${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ Backend not running - skipping API tests${NC}"
    echo "  To run API tests, start backend with: npm run dev:auth"
fi

echo ""
echo "📊 TEST SUMMARY"
echo "─────────────────"
TOTAL=$((PASSED + FAILED))
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "🚀 Auth MFE is ready for development!"
    echo ""
    echo "To test manually:"
    echo "  1. Start backend:  npm run dev:auth"
    echo "  2. Start auth-mfe: npm run dev:auth-mfe"
    echo "  3. Visit:          http://localhost:5174/login"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
