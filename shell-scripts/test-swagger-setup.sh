#!/bin/bash

echo "🧪 Testing Swagger/OpenAPI Documentation Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if files exist
echo "1️⃣ Checking Swagger configuration files..."

services=("auth-service" "chatbot-service" "admin-service")
all_good=true

for service in "${services[@]}"; do
    if [ -f "apps/$service/src/swagger.ts" ]; then
        echo -e "${GREEN}✓${NC} apps/$service/src/swagger.ts exists"
    else
        echo -e "${RED}✗${NC} apps/$service/src/swagger.ts missing"
        all_good=false
    fi
done

echo ""
echo "2️⃣ Checking Swagger imports in main.ts..."

for service in "${services[@]}"; do
    if grep -q "swagger-ui-express" "apps/$service/src/main.ts"; then
        echo -e "${GREEN}✓${NC} $service imports swagger-ui-express"
    else
        echo -e "${RED}✗${NC} $service missing swagger-ui-express import"
        all_good=false
    fi
    
    if grep -q "/api-docs" "apps/$service/src/main.ts"; then
        echo -e "${GREEN}✓${NC} $service exposes /api-docs endpoint"
    else
        echo -e "${RED}✗${NC} $service missing /api-docs endpoint"
        all_good=false
    fi
done

echo ""
echo "3️⃣ Checking JSDoc comments in routes..."

if grep -q "@swagger" "apps/auth-service/src/routes/auth.routes.ts"; then
    echo -e "${GREEN}✓${NC} Auth routes have Swagger docs"
else
    echo -e "${RED}✗${NC} Auth routes missing Swagger docs"
    all_good=false
fi

if grep -q "@swagger" "apps/chatbot-service/src/routes/chat.routes.ts"; then
    echo -e "${GREEN}✓${NC} Chatbot routes have Swagger docs"
else
    echo -e "${RED}✗${NC} Chatbot routes missing Swagger docs"
    all_good=false
fi

if grep -q "@swagger" "apps/admin-service/src/routes/admin.routes.ts"; then
    echo -e "${GREEN}✓${NC} Admin routes have Swagger docs"
else
    echo -e "${RED}✗${NC} Admin routes missing Swagger docs"
    all_good=false
fi

echo ""
echo "4️⃣ Checking OpenAPI schemas..."

for service in "${services[@]}"; do
    if grep -q "openapi: '3.0.0'" "apps/$service/src/swagger.ts"; then
        echo -e "${GREEN}✓${NC} $service uses OpenAPI 3.0.0"
    else
        echo -e "${YELLOW}⚠${NC} $service OpenAPI version check failed"
    fi
    
    if grep -q "bearerAuth" "apps/$service/src/swagger.ts"; then
        echo -e "${GREEN}✓${NC} $service has JWT authentication schema"
    else
        echo -e "${RED}✗${NC} $service missing authentication schema"
        all_good=false
    fi
done

echo ""
echo "5️⃣ Checking documentation update..."

if grep -q "## API Documentation" "docs/PRODUCTION_DEPLOYMENT.md"; then
    echo -e "${GREEN}✓${NC} PRODUCTION_DEPLOYMENT.md has API Documentation section"
else
    echo -e "${RED}✗${NC} PRODUCTION_DEPLOYMENT.md missing API Documentation"
    all_good=false
fi

if grep -q "/api-docs" "docs/PRODUCTION_DEPLOYMENT.md"; then
    echo -e "${GREEN}✓${NC} Documentation includes Swagger URL instructions"
else
    echo -e "${RED}✗${NC} Documentation missing Swagger URLs"
    all_good=false
fi

echo ""
echo "6️⃣ Checking dependencies..."

if grep -q "\"swagger-jsdoc\"" "package.json"; then
    echo -e "${GREEN}✓${NC} swagger-jsdoc installed"
else
    echo -e "${RED}✗${NC} swagger-jsdoc not installed"
    all_good=false
fi

if grep -q "\"swagger-ui-express\"" "package.json"; then
    echo -e "${GREEN}✓${NC} swagger-ui-express installed"
else
    echo -e "${RED}✗${NC} swagger-ui-express not installed"
    all_good=false
fi

echo ""
echo "7️⃣ Verifying builds..."

echo -e "${YELLOW}Building services...${NC}"
nx build auth-service > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} auth-service builds successfully"
else
    echo -e "${RED}✗${NC} auth-service build failed"
    all_good=false
fi

nx build chatbot-service > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} chatbot-service builds successfully"
else
    echo -e "${RED}✗${NC} chatbot-service build failed"
    all_good=false
fi

nx build admin-service > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} admin-service builds successfully"
else
    echo -e "${RED}✗${NC} admin-service build failed"
    all_good=false
fi

echo ""

if [ "$all_good" = true ]; then
    echo -e "${GREEN}✅ Swagger/OpenAPI Setup Complete!${NC}"
    echo ""
    echo "📚 API Documentation will be available at:"
    echo "  • Auth Service:    http://localhost:3000/api-docs"
    echo "  • Chatbot Service: http://localhost:3001/api-docs"
    echo "  • Admin Service:   http://localhost:3002/api-docs"
    echo ""
    echo "🚀 To test:"
    echo "  1. Start services: npm run dev:backend"
    echo "  2. Visit http://localhost:3000/api-docs"
    echo "  3. Click 'Authorize' and enter your JWT token"
    echo "  4. Try out endpoints interactively"
    echo ""
    echo "📖 Features:"
    echo "  ✓ Interactive API testing in browser"
    echo "  ✓ Request/response examples for all endpoints"
    echo "  ✓ Built-in JWT authentication"
    echo "  ✓ Complete schema documentation"
    echo "  ✓ Export OpenAPI 3.0 specifications"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
