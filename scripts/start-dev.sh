#!/bin/bash

# Start backend services in dependency order
# 1. Individual services first (they don't depend on anything)
# 2. Then gateway (depends on all services)

set -e

PROJECT_DIR="/Users/patea/2026/projects/ai-chatbot-fullstack-2026"
cd "$PROJECT_DIR"

echo "Starting Auth Service (port 3000)..."
nx serve auth-service --inspect=false > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
sleep 3

echo "Starting Chatbot Service (port 3001)..."
nx serve chatbot-service --inspect=false > /tmp/chatbot-service.log 2>&1 &
CHATBOT_PID=$!
sleep 3

echo "Starting Admin Service (port 3002)..."
nx serve admin-service --inspect=false > /tmp/admin-service.log 2>&1 &
ADMIN_PID=$!
sleep 3

echo "Starting GraphQL Gateway (port 4000)..."
nx serve graphql-gateway > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "PIDs:"
echo "  Auth Service: $AUTH_PID"
echo "  Chatbot Service: $CHATBOT_PID"
echo "  Admin Service: $ADMIN_PID"
echo "  Gateway: $GATEWAY_PID"
echo ""
echo "Logs:"
echo "  tail -f /tmp/auth-service.log"
echo "  tail -f /tmp/chatbot-service.log"
echo "  tail -f /tmp/admin-service.log"
echo "  tail -f /tmp/gateway.log"
echo ""
echo "To stop services: kill $AUTH_PID $CHATBOT_PID $ADMIN_PID $GATEWAY_PID"
echo ""

wait
