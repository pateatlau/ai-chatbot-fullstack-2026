#!/bin/bash

# ============================================
# AI Chatbot Fullstack - Testing Infrastructure Validator
# ============================================
# This script verifies all testing frameworks are properly configured
# and ready for running tests.
# ============================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  AI Chatbot Fullstack - Testing Infrastructure Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================
# Phase 1: Node Environment Verification
# ============================================
echo -e "${CYAN}Phase 1: Node Environment Verification${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 1: Node.js Installed
echo -n "Test 1: Node.js Installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "        Version: $NODE_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "        Node.js not found. Please install Node.js 18+"
    ((FAILED++))
fi

# Test 2: npm Installed
echo -n "Test 2: npm Installation... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "        Version: $NPM_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 3: node_modules Exists
echo -n "Test 3: Dependencies Installed... "
if [ -d "node_modules" ]; then
    PKG_COUNT=$(ls -1 node_modules | wc -l)
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "        Packages: $PKG_COUNT installed"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "        Run: npm install"
    ((FAILED++))
fi

echo ""

# ============================================
# Phase 2: Nx Configuration Verification
# ============================================
echo -e "${CYAN}Phase 2: Nx Configuration Verification${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 4: Nx CLI
echo -n "Test 4: Nx CLI Available... "
if command -v nx &> /dev/null; then
    NX_VERSION=$(nx --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "        Version: $NX_VERSION"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "        Nx not in PATH, but should work via npx"
    ((WARNINGS++))
fi

# Test 5: nx.json Configuration
echo -n "Test 5: Nx Configuration File... "
if [ -f "nx.json" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""

# ============================================
# Phase 3: Jest Configuration Verification
# ============================================
echo -e "${CYAN}Phase 3: Jest Configuration (Backend Unit Tests)${NC}"
echo -e "${BLUE}────────────────────────────────────────────────${NC}"
echo ""

# Test 6: Jest Package
echo -n "Test 6: Jest Package Installed... "
if [ -d "node_modules/jest" ]; then
    JEST_VERSION=$(node -e "console.log(require('jest/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "        Version: $JEST_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 7: Jest Configuration File
echo -n "Test 7: Jest Config File... "
if [ -f "jest.config.js" ] || [ -f "jest.preset.js" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 8: ts-jest
echo -n "Test 8: ts-jest Installed... "
if [ -d "node_modules/ts-jest" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "        May be needed for TypeScript test files"
    ((WARNINGS++))
fi

# Test 9: Jest Mock Service Worker (MSW)
echo -n "Test 9: Mock Service Worker (MSW)... "
if [ -d "node_modules/msw" ]; then
    MSW_VERSION=$(node -e "console.log(require('msw/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "        Version: $MSW_VERSION"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "        Good for mocking API calls in tests"
    ((WARNINGS++))
fi

echo ""

# ============================================
# Phase 4: Vitest Configuration Verification
# ============================================
echo -e "${CYAN}Phase 4: Vitest Configuration (Store Tests)${NC}"
echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo ""

# Test 10: Vitest Package
echo -n "Test 10: Vitest Package Installed... "
if [ -d "node_modules/vitest" ]; then
    VITEST_VERSION=$(node -e "console.log(require('vitest/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Version: $VITEST_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "         Run: npm install vitest"
    ((FAILED++))
fi

# Test 11: Vitest Workspace Config
echo -n "Test 11: Vitest Workspace Config... "
if [ -f "vitest.workspace.ts" ] || [ -f "vitest.config.ts" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         Vitest might still work with defaults"
    ((WARNINGS++))
fi

# Test 12: Testing Library
echo -n "Test 12: Testing Library for React... "
if [ -d "node_modules/@testing-library/react" ]; then
    RTL_VERSION=$(node -e "console.log(require('@testing-library/react/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Version: $RTL_VERSION"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         Good for React component testing"
    ((WARNINGS++))
fi

# Test 13: jsdom
echo -n "Test 13: jsdom (DOM Environment)... "
if [ -d "node_modules/jsdom" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         May be needed for browser API simulation"
    ((WARNINGS++))
fi

echo ""

# ============================================
# Phase 5: Playwright E2E Configuration
# ============================================
echo -e "${CYAN}Phase 5: Playwright E2E Configuration${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 14: Playwright Package
echo -n "Test 14: Playwright Package Installed... "
if [ -d "node_modules/@playwright/test" ]; then
    PW_VERSION=$(node -e "console.log(require('@playwright/test/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Version: $PW_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "         Run: npm install @playwright/test"
    ((FAILED++))
fi

# Test 15: Playwright Config
echo -n "Test 15: Playwright Config File... "
if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "         Missing: playwright.config.ts"
    ((FAILED++))
fi

# Test 16: E2E Tests Directory
echo -n "Test 16: E2E Tests Directory... "
if [ -d "e2e" ]; then
    TEST_COUNT=$(find e2e -name "*.spec.ts" 2>/dev/null | wc -l || echo 0)
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Tests found: $TEST_COUNT"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         E2E directory exists but may be empty"
    ((WARNINGS++))
fi

echo ""

# ============================================
# Phase 6: Type Checking Verification
# ============================================
echo -e "${CYAN}Phase 6: Type Checking Verification${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 17: TypeScript
echo -n "Test 17: TypeScript Installed... "
if [ -d "node_modules/typescript" ]; then
    TS_VERSION=$(node -e "console.log(require('typescript/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Version: $TS_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 18: tsconfig.base.json
echo -n "Test 18: TypeScript Config... "
if [ -f "tsconfig.base.json" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 19: TypeScript Strict Mode
echo -n "Test 19: TypeScript Strict Mode... "
if grep -q '"strict": true' tsconfig.base.json 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Strict mode enabled"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         Strict mode not enabled (recommended)"
    ((WARNINGS++))
fi

echo ""

# ============================================
# Phase 7: Linting Configuration
# ============================================
echo -e "${CYAN}Phase 7: Linting Configuration${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 20: ESLint
echo -n "Test 20: ESLint Installed... "
if [ -d "node_modules/eslint" ]; then
    ESLINT_VERSION=$(node -e "console.log(require('eslint/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Version: $ESLINT_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Test 21: ESLint Config
echo -n "Test 21: ESLint Config Files... "
if [ -f "eslint.base.config.cjs" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    ((WARNINGS++))
fi

# Test 22: Prettier
echo -n "Test 22: Prettier Installed... "
if [ -d "node_modules/prettier" ]; then
    PRETTIER_VERSION=$(node -e "console.log(require('prettier/package.json').version)" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Version: $PRETTIER_VERSION"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    ((WARNINGS++))
fi

echo ""

# ============================================
# Phase 8: Project Structure Verification
# ============================================
echo -e "${CYAN}Phase 8: Project Structure Verification${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 23: Backend Services Exist
echo -n "Test 23: Backend Services Directory... "
BACKEND_SERVICES=0
[ -d "apps/auth-service" ] && ((BACKEND_SERVICES++))
[ -d "apps/chatbot-service" ] && ((BACKEND_SERVICES++))
[ -d "apps/admin-service" ] && ((BACKEND_SERVICES++))

if [ $BACKEND_SERVICES -ge 3 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Services: $BACKEND_SERVICES found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         Services: $BACKEND_SERVICES found (expected 3)"
    ((WARNINGS++))
fi

# Test 24: Frontend Apps Exist
echo -n "Test 24: Frontend Apps Directory... "
FRONTEND_APPS=0
[ -d "apps/auth-mfe" ] && ((FRONTEND_APPS++))
[ -d "apps/chatbot-mfe" ] && ((FRONTEND_APPS++))
[ -d "apps/shell" ] && ((FRONTEND_APPS++))

if [ $FRONTEND_APPS -ge 3 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Apps: $FRONTEND_APPS found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         Apps: $FRONTEND_APPS found (expected 3+)"
    ((WARNINGS++))
fi

# Test 25: Shared Libraries Exist
echo -n "Test 25: Shared Libraries Directory... "
if [ -d "libs" ]; then
    LIB_COUNT=$(ls -1 libs 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "         Libraries: $LIB_COUNT found"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    ((WARNINGS++))
fi

echo ""

# ============================================
# Phase 9: Package Scripts Verification
# ============================================
echo -e "${CYAN}Phase 9: Available NPM Scripts${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Extract and display test scripts
SCRIPTS=$(node -e "const pkg = require('./package.json'); Object.keys(pkg.scripts).filter(k => k.includes('test')).forEach(k => console.log('   ✓ npm run ' + k))" 2>/dev/null || echo "   (Could not read package.json)")

echo "Available test scripts:"
echo "$SCRIPTS"

echo ""

# ============================================
# Phase 10: Test Readiness Simulation
# ============================================
echo -e "${CYAN}Phase 10: Test Execution Readiness${NC}"
echo -e "${BLUE}────────────────────────────────────────${NC}"
echo ""

# Test 26: Can run nx list command
echo -n "Test 26: Nx Project List... "
if npx nx list --type app > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "         Nx commands might need reset"
    ((WARNINGS++))
fi

# Test 27: package.json valid JSON
echo -n "Test 27: package.json Valid... "
if node -e "require('./package.json')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "         package.json has syntax errors"
    ((FAILED++))
fi

echo ""

# ============================================
# Summary Report
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                    TEST SUMMARY REPORT            ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
PASS_RATE=$((PASSED * 100 / TOTAL))

echo "  ${GREEN}✓ Passed:${NC}   $PASSED"
echo "  ${RED}✗ Failed:${NC}   $FAILED"
echo "  ${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo "  ─────────────────────"
echo "  Total:     $TOTAL tests"
echo "  Success:   $PASS_RATE%"
echo ""

if [ $FAILED -eq 0 ] && [ $PASS_RATE -ge 95 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}          ✅ TESTING INFRASTRUCTURE READY        ${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  Recommended test commands:"
    echo "  → npm run test              (Jest unit tests)"
    echo "  → npm run test:watch        (Jest watch mode)"
    echo "  → npm run test:stores       (Vitest stores)"
    echo "  → npm run test:e2e          (Playwright E2E)"
    echo "  → npm run test:e2e:headed   (E2E interactive)"
    echo "  → npm run test:e2e:ui       (Playwright UI)"
    echo "  → npm run test:smoke        (Smoke tests)"
    echo ""
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}     ⚠️  TESTING INFRASTRUCTURE MOSTLY READY      ${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  $WARNINGS warnings to review."
    echo "  Testing can proceed with caution."
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}     ❌ TESTING INFRASTRUCTURE NOT READY          ${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "  $FAILED critical issues must be fixed before testing."
    echo ""
    exit 1
fi
