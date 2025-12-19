#!/bin/bash

# GraphQL Gateway Environment Configuration
# Run this to set up local environment variables

cat > .env.local << 'EOF'
# GraphQL Gateway Configuration
HOST=localhost
PORT=4000
NODE_ENV=development

# Subgraph URLs (adjust if services running on different hosts)
AUTH_SUBGRAPH_URL=http://localhost:3000/graphql
CHATBOT_SUBGRAPH_URL=http://localhost:3001/graphql
ADMIN_SUBGRAPH_URL=http://localhost:3002/graphql

# Frontend Configuration
VITE_GRAPHQL_URL=http://localhost:4000/graphql

# Logging
LOG_LEVEL=debug
EOF

echo "✅ Environment file created: .env.local"
echo ""
echo "Current configuration:"
cat .env.local
