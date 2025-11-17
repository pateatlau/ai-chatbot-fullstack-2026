#!/bin/bash

# Shell Integration Test Script
# Tests all routing, navigation, and MFE loading

set -e

# Colors for output
reset="\033[0m"
green="\033[32m"
red="\033[31m"
yellow="\033[33m"
blue="\033[34m"
cyan="\033[36m"

echo -e "${cyan}═══════════════════════════════════════${reset}"
echo -e "${cyan}   Shell Integration Test Suite${reset}"
echo -e "${cyan}═══════════════════════════════════════${reset}"
echo ""

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Test function
test_case() {
  TOTAL=$((TOTAL + 1))
  if [ $? -eq 0 ]; then
    echo -e "${green}✓${reset} $1"
    PASSED=$((PASSED + 1))
  else
    echo -e "${red}✗${reset} $1"
    FAILED=$((FAILED + 1))
  fi
}

# Helper function
check_file() {
  if [ -f "$1" ]; then
    return 0
  else
    return 1
  fi
}

check_content() {
  if grep -q "$2" "$1"; then
    return 0
  else
    return 1
  fi
}

echo -e "${blue}📋 Route Configuration Tests${reset}"
echo ""

# Test route file exists
check_file "apps/shell/src/routes/index.tsx"
test_case "Routes configuration file exists"

# Test all MFE routes are configured
check_content "apps/shell/src/routes/index.tsx" "path: 'chat'"
test_case "Chat route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'chat/:conversationId'"
test_case "Chat conversation route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'admin'"
test_case "Admin dashboard route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'admin/users'"
test_case "Admin users route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'admin/users/:userId'"
test_case "Admin user detail route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'admin/audit-logs'"
test_case "Admin audit logs route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'profile'"
test_case "Profile route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'profile/settings'"
test_case "Profile settings route configured"

check_content "apps/shell/src/routes/index.tsx" "path: 'profile/security'"
test_case "Profile security route configured"

echo ""
echo -e "${blue}🔐 Route Guards Tests${reset}"
echo ""

# Test route guards
check_file "apps/shell/src/components/ProtectedRoute.tsx"
test_case "ProtectedRoute component exists"

check_file "apps/shell/src/components/AdminRoute.tsx"
test_case "AdminRoute component exists"

check_content "apps/shell/src/components/AdminRoute.tsx" "role !== 'ADMIN'"
test_case "AdminRoute checks for ADMIN role"

check_content "apps/shell/src/components/ProtectedRoute.tsx" "Navigate to=\"/login\""
test_case "ProtectedRoute redirects to login"

check_content "apps/shell/src/routes/index.tsx" "AdminRoute"
test_case "Admin routes use AdminRoute guard"

echo ""
echo -e "${blue}🧭 Navigation Tests${reset}"
echo ""

# Test navigation
check_file "apps/shell/src/layouts/DashboardLayout.tsx"
test_case "DashboardLayout exists"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "to=\"/chat\""
test_case "Navigation has Chat link"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "to=\"/admin\""
test_case "Navigation has Admin link (role-gated)"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "hasRole('ADMIN')"
test_case "Admin link is role-gated"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "to=\"/profile\""
test_case "User dropdown has Profile link"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "to=\"/profile/settings\""
test_case "User dropdown has Settings link"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "to=\"/profile/security\""
test_case "User dropdown has Security link"

check_content "apps/shell/src/layouts/DashboardLayout.tsx" "handleLogout"
test_case "User dropdown has Logout button"

echo ""
echo -e "${blue}📦 Module Federation Tests${reset}"
echo ""

# Test MFE components
check_file "apps/shell/src/components/AuthMfe.tsx"
test_case "AuthMfe component exists"

check_file "apps/shell/src/components/ChatbotMfe.tsx"
test_case "ChatbotMfe component exists"

check_file "apps/shell/src/components/AdminMfe.tsx"
test_case "AdminMfe component exists"

check_file "apps/shell/src/components/ProfileMfe.tsx"
test_case "ProfileMfe component exists"

check_content "apps/shell/src/components/AuthMfe.tsx" "import('authMfe/Module')"
test_case "AuthMfe loads remote module"

check_content "apps/shell/src/components/ChatbotMfe.tsx" "import('chatbotMfe/Module')"
test_case "ChatbotMfe loads remote module"

check_content "apps/shell/src/components/AdminMfe.tsx" "import('adminMfe/Module')"
test_case "AdminMfe loads remote module"

check_content "apps/shell/src/components/ProfileMfe.tsx" "import('profileMfe/Module')"
test_case "ProfileMfe loads remote module"

echo ""
echo -e "${blue}⚙️  Configuration Tests${reset}"
echo ""

# Test Vite config
check_file "apps/shell/vite.config.ts"
test_case "Vite config exists"

check_content "apps/shell/vite.config.ts" "authMfe"
test_case "Auth MFE configured in Module Federation"

check_content "apps/shell/vite.config.ts" "chatbotMfe"
test_case "Chatbot MFE configured in Module Federation"

check_content "apps/shell/vite.config.ts" "adminMfe"
test_case "Admin MFE configured in Module Federation"

check_content "apps/shell/vite.config.ts" "profileMfe"
test_case "Profile MFE configured in Module Federation"

check_content "apps/shell/vite.config.ts" "localhost:5174"
test_case "Auth MFE port configured (5174)"

check_content "apps/shell/vite.config.ts" "localhost:5175"
test_case "Chatbot MFE port configured (5175)"

check_content "apps/shell/vite.config.ts" "localhost:5176"
test_case "Admin MFE port configured (5176)"

check_content "apps/shell/vite.config.ts" "localhost:5177"
test_case "Profile MFE port configured (5177)"

echo ""
echo -e "${blue}🎨 UI/UX Tests${reset}"
echo ""

# Test user experience elements
check_content "apps/shell/src/components/AuthMfe.tsx" "Loading"
test_case "Loading fallbacks configured"

check_content "apps/shell/src/components/ProtectedRoute.tsx" "isLoading"
test_case "Protected routes handle loading state"

check_content "apps/shell/src/components/AdminRoute.tsx" "isLoading"
test_case "Admin routes handle loading state"

check_content "apps/shell/src/app/App.tsx" "ErrorBoundary"
test_case "Error boundary configured"

check_content "apps/shell/src/app/App.tsx" "ToastContainer"
test_case "Toast notifications configured"

echo ""
echo -e "${cyan}═══════════════════════════════════════${reset}"
echo -e "${cyan}           Test Summary${reset}"
echo -e "${cyan}═══════════════════════════════════════${reset}"

SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")

echo -e "  ${green}✓${reset} Passed: ${green}$PASSED${reset}"
echo -e "  ${red}✗${reset} Failed: ${red}$FAILED${reset}"
echo -e "  Total:  $TOTAL"
echo -e "  Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${green}✨ All tests passed! Shell integration is ready.${reset}"
  echo ""
  echo -e "${cyan}Shell Integration Status:${reset}"
  echo -e "  ✓ All 4 MFEs configured (Auth, Chatbot, Admin, Profile)"
  echo -e "  ✓ Complete routing with guards"
  echo -e "  ✓ Role-based navigation"
  echo -e "  ✓ User dropdown with profile links"
  echo -e "  ✓ Module Federation configured"
  echo ""
  exit 0
else
  echo -e "${red}Some tests failed!${reset}"
  exit 1
fi
