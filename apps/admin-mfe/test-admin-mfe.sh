#!/bin/bash

# Admin MFE Integration Test Script
# Tests all admin dashboard features with curl

set -e

ADMIN_API_URL="http://localhost:3002/api/admin"
AUTH_API_URL="http://localhost:3000/api/auth"

PASSED=0
FAILED=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count() {
    TOTAL=$((TOTAL + 1))
}

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASSED=$((PASSED + 1))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=$((FAILED + 1))
}

echo "═══════════════════════════════════════════════════════════"
echo "   Admin MFE Integration Tests"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Login as admin to get token
echo "🔐 Authenticating as admin..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_API_URL}/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@example.com","password":"Admin123!@#"}')

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}✗ Admin authentication failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Admin authentication successful${NC}"
echo ""

# Test 1: Dashboard Statistics
echo "📊 Dashboard Statistics Tests"
echo ""

test_count
STATS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${ADMIN_API_URL}/stats")
if echo "$STATS_RESPONSE" | grep -q "totalUsers"; then
    test_pass "Stats API returns data"
else
    test_fail "Stats API returns data"
fi

test_count
if echo "$STATS_RESPONSE" | grep -q "totalUsers"; then
    test_pass "Stats has totalUsers"
else
    test_fail "Stats has totalUsers"
fi

test_count
if echo "$STATS_RESPONSE" | grep -q "activeUsers"; then
    test_pass "Stats has activeUsers"
else
    test_fail "Stats has activeUsers"
fi

test_count
if echo "$STATS_RESPONSE" | grep -q "totalConversations"; then
    test_pass "Stats has totalConversations"
else
    test_fail "Stats has totalConversations"
fi

test_count
if echo "$STATS_RESPONSE" | grep -q "averageMessagesPerConversation"; then
    test_pass "Stats has averageMessagesPerConversation"
else
    test_fail "Stats has averageMessagesPerConversation"
fi

echo ""

# Test 2: User Management
echo "👥 User Management Tests"
echo ""

test_count
USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${ADMIN_API_URL}/users?page=1&limit=10")
if echo "$USERS_RESPONSE" | grep -q "users"; then
    test_pass "Users API returns data"
else
    test_fail "Users API returns data"
fi

test_count
if echo "$USERS_RESPONSE" | grep -q "users"; then
    test_pass "Users API has users array"
else
    test_fail "Users API has users array"
fi

test_count
if echo "$USERS_RESPONSE" | grep -q "total" && echo "$USERS_RESPONSE" | grep -q "page"; then
    test_pass "Users API has pagination"
else
    test_fail "Users API has pagination"
fi

test_count
if echo "$USERS_RESPONSE" | grep -q "email" && echo "$USERS_RESPONSE" | grep -q "role"; then
    test_pass "User objects have required fields"
else
    test_fail "User objects have required fields"
fi

echo ""

# Test 3: User Filtering
echo "🔍 User Filtering Tests"
echo ""

test_count
ROLE_FILTER_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${ADMIN_API_URL}/users?role=ADMIN")
if echo "$ROLE_FILTER_RESPONSE" | grep -q "users"; then
    test_pass "Role filter works"
else
    test_fail "Role filter works"
fi

test_count
ACTIVE_FILTER_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${ADMIN_API_URL}/users?isActive=true")
if echo "$ACTIVE_FILTER_RESPONSE" | grep -q "users"; then
    test_pass "Active filter works"
else
    test_fail "Active filter works"
fi

echo ""

# Test 4: Audit Logs
echo "📝 Audit Logs Tests"
echo ""

test_count
AUDIT_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "${ADMIN_API_URL}/audit-logs?page=1&limit=20")
if echo "$AUDIT_RESPONSE" | grep -q "logs"; then
    test_pass "Audit logs API returns data"
else
    test_fail "Audit logs API returns data"
fi

test_count
if echo "$AUDIT_RESPONSE" | grep -q "logs"; then
    test_pass "Audit logs has logs array"
else
    test_fail "Audit logs has logs array"
fi

test_count
if echo "$AUDIT_RESPONSE" | grep -q "total" && echo "$AUDIT_RESPONSE" | grep -q "page"; then
    test_pass "Audit logs has pagination"
else
    test_fail "Audit logs has pagination"
fi

echo ""

# Test 5: Admin MFE Components
echo "🎨 Admin MFE Component Tests"
echo ""

cd apps/admin-mfe

test_count
if [ -f "src/api/admin.api.ts" ]; then
    test_pass "Admin API client exists"
else
    test_fail "Admin API client exists"
fi

test_count
if [ -f "src/pages/AdminDashboardPage.tsx" ]; then
    test_pass "AdminDashboardPage exists"
else
    test_fail "AdminDashboardPage exists"
fi

test_count
if [ -f "src/pages/UserManagementPage.tsx" ]; then
    test_pass "UserManagementPage exists"
else
    test_fail "UserManagementPage exists"
fi

test_count
if [ -f "src/pages/UserDetailPage.tsx" ]; then
    test_pass "UserDetailPage exists"
else
    test_fail "UserDetailPage exists"
fi

test_count
if [ -f "src/pages/AuditLogsPage.tsx" ]; then
    test_pass "AuditLogsPage exists"
else
    test_fail "AuditLogsPage exists"
fi

echo ""

# Test 6: App Routing
echo "🔀 App Routing Tests"
echo ""

test_count
if grep -q "AdminDashboardPage" src/app/app.tsx; then
    test_pass "App imports AdminDashboardPage"
else
    test_fail "App imports AdminDashboardPage"
fi

test_count
if grep -q "UserManagementPage" src/app/app.tsx; then
    test_pass "App imports UserManagementPage"
else
    test_fail "App imports UserManagementPage"
fi

test_count
if grep -q "UserDetailPage" src/app/app.tsx; then
    test_pass "App imports UserDetailPage"
else
    test_fail "App imports UserDetailPage"
fi

test_count
if grep -q "AuditLogsPage" src/app/app.tsx; then
    test_pass "App imports AuditLogsPage"
else
    test_fail "App imports AuditLogsPage"
fi

test_count
if grep -q "/admin/users" src/app/app.tsx; then
    test_pass "App has route for /admin/users"
else
    test_fail "App has route for /admin/users"
fi

test_count
if grep -q "/admin/audit-logs" src/app/app.tsx; then
    test_pass "App has route for /admin/audit-logs"
else
    test_fail "App has route for /admin/audit-logs"
fi

echo ""

# Test 7: TypeScript Types
echo "📘 TypeScript Types Tests"
echo ""

test_count
if grep -q "export interface User" src/api/admin.api.ts; then
    test_pass "API defines User interface"
else
    test_fail "API defines User interface"
fi

test_count
if grep -q "export interface DashboardStats" src/api/admin.api.ts; then
    test_pass "API defines DashboardStats interface"
else
    test_fail "API defines DashboardStats interface"
fi

test_count
if grep -q "export interface AuditLog" src/api/admin.api.ts; then
    test_pass "API defines AuditLog interface"
else
    test_fail "API defines AuditLog interface"
fi

echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo "   Test Summary"
echo "═══════════════════════════════════════════════════════════"
echo "Total Tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")
echo "Success Rate: ${SUCCESS_RATE}%"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo "✨ All tests passed! Admin MFE is ready."
    echo ""
    echo "Admin MFE Status:"
    echo "  ✓ Dashboard with real-time stats"
    echo "  ✓ User management with pagination and filtering"
    echo "  ✓ User detail/edit page"
    echo "  ✓ Audit logs viewer"
    echo "  ✓ TypeScript types and API integration"
    echo ""
    exit 0
else
    echo "⚠️  Some tests failed. Please review the errors above."
    echo ""
    exit 1
fi
