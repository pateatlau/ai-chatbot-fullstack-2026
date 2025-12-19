#!/bin/bash

# Kill any existing services
pkill -9 -f "nx serve"
sleep 2

cd /Users/patea/2026/projects/ai-chatbot-fullstack-2026

echo "Starting Auth Service..."
npx nx serve auth-service --inspect=false > /tmp/auth.log 2>&1 &
AUTH_PID=$!
sleep 20

echo "Checking Auth Service..."
if nc -z localhost 3000 2>/dev/null; then
    echo "✓ Auth Service is UP"
else
    echo "✗ Auth Service FAILED to start"
    exit 1
fi

echo "Starting Chatbot Service..."
npx nx serve chatbot-service --inspect=false > /tmp/chatbot.log 2>&1 &
CHATBOT_PID=$!
sleep 20

echo "Checking Chatbot Service..."
if nc -z localhost 3001 2>/dev/null; then
    echo "✓ Chatbot Service is UP"
else
    echo "✗ Chatbot Service FAILED to start"
    exit 1
fi

echo "Starting Admin Service..."
npx nx serve admin-service --inspect=false > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
sleep 20

echo "Checking Admin Service..."
if nc -z localhost 3002 2>/dev/null; then
    echo "✓ Admin Service is UP"
else
    echo "✗ Admin Service FAILED to start"
    exit 1
fi

echo "Starting GraphQL Gateway..."
npx nx serve graphql-gateway > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
sleep 25

echo "Checking GraphQL Gateway..."
if nc -z localhost 4000 2>/dev/null; then
    echo "✓ Gateway is UP"
else
    echo "✗ Gateway FAILED to start"
    tail -50 /tmp/gateway.log
    exit 1
fi

echo ""
echo "================================"
echo "All Services Started Successfully!"
echo "================================"
echo "Auth Service:    http://localhost:3000/graphql"
echo "Chatbot Service: http://localhost:3001/graphql"
echo "Admin Service:   http://localhost:3002/graphql"
echo "GraphQL Gateway: http://localhost:4000/graphql"
echo ""
echo "PIDs: Auth=$AUTH_PID Chatbot=$CHATBOT_PID Admin=$ADMIN_PID Gateway=$GATEWAY_PID"
