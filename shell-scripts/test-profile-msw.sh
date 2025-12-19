#!/bin/bash

echo "🧪 Testing Profile MFE MSW Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if files exist
echo "1️⃣ Checking MSW setup files..."

if [ -f "apps/profile-mfe/src/mocks/config.ts" ]; then
    echo -e "${GREEN}✓${NC} config.ts exists"
else
    echo -e "${RED}✗${NC} config.ts missing"
    exit 1
fi

if [ -f "apps/profile-mfe/src/mocks/README.md" ]; then
    echo -e "${GREEN}✓${NC} README.md exists"
else
    echo -e "${RED}✗${NC} README.md missing"
    exit 1
fi

if [ -f "apps/profile-mfe/public/mockServiceWorker.js" ]; then
    echo -e "${GREEN}✓${NC} mockServiceWorker.js exists"
else
    echo -e "${RED}✗${NC} mockServiceWorker.js missing"
    exit 1
fi

if [ -f "apps/profile-mfe/.env.development" ]; then
    echo -e "${GREEN}✓${NC} .env.development exists"
else
    echo -e "${RED}✗${NC} .env.development missing"
    exit 1
fi

if [ -f "apps/profile-mfe/.env.mock" ]; then
    echo -e "${GREEN}✓${NC} .env.mock exists"
else
    echo -e "${RED}✗${NC} .env.mock missing"
    exit 1
fi

echo ""
echo "2️⃣ Checking profile handlers..."

if [ -f "libs/frontend/mocks/src/handlers/profile.handlers.ts" ]; then
    echo -e "${GREEN}✓${NC} profile.handlers.ts exists"
    
    # Check for key endpoints
    if grep -q "GET /api/users/me" libs/frontend/mocks/src/handlers/profile.handlers.ts; then
        echo -e "${GREEN}✓${NC} GET /api/users/me handler found"
    fi
    
    if grep -q "PATCH /api/users/me" libs/frontend/mocks/src/handlers/profile.handlers.ts; then
        echo -e "${GREEN}✓${NC} PATCH /api/users/me handler found"
    fi
    
    if grep -q "POST /api/users/change-password" libs/frontend/mocks/src/handlers/profile.handlers.ts; then
        echo -e "${GREEN}✓${NC} POST /api/users/change-password handler found"
    fi
    
    if grep -q "GET /api/users/settings" libs/frontend/mocks/src/handlers/profile.handlers.ts; then
        echo -e "${GREEN}✓${NC} GET /api/users/settings handler found"
    fi
    
    if grep -q "GET /api/users/sessions" libs/frontend/mocks/src/handlers/profile.handlers.ts; then
        echo -e "${GREEN}✓${NC} GET /api/users/sessions handler found"
    fi
else
    echo -e "${RED}✗${NC} profile.handlers.ts missing"
    exit 1
fi

echo ""
echo "3️⃣ Checking integration with browser.ts..."

if grep -q "profileHandlers" libs/frontend/mocks/src/browser.ts; then
    echo -e "${GREEN}✓${NC} profileHandlers imported in browser.ts"
else
    echo -e "${RED}✗${NC} profileHandlers not imported in browser.ts"
    exit 1
fi

echo ""
echo "4️⃣ Checking package.json scripts..."

if grep -q "dev:profile-mfe:mock" package.json; then
    echo -e "${GREEN}✓${NC} dev:profile-mfe:mock script exists"
else
    echo -e "${RED}✗${NC} dev:profile-mfe:mock script missing"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Profile MFE MSW Setup Complete!${NC}"
echo ""
echo "📋 Available commands:"
echo "  • npm run dev:profile-mfe         - Run with real backend"
echo "  • npm run dev:profile-mfe:mock    - Run with MSW mocks"
echo ""
echo "🧪 Test users:"
echo "  • admin@example.com / Admin@123 (ADMIN)"
echo "  • user@example.com / User@123 (USER)"
echo ""
echo "🎯 Mocked endpoints:"
echo "  • GET /api/users/me"
echo "  • PATCH /api/users/me"
echo "  • POST /api/users/change-password"
echo "  • GET /api/users/settings"
echo "  • PATCH /api/users/settings"
echo "  • GET /api/users/sessions"
echo "  • DELETE /api/users/sessions/:id"
