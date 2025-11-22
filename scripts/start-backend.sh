#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")/.."

echo -e "${YELLOW}Starting backend services...${NC}"
echo ""

# Function to check if a port is listening
wait_for_port() {
  local port=$1
  local service=$2
  local max_attempts=60
  local attempt=0

  echo -e "${YELLOW}Waiting for $service on port $port...${NC}"
  
  while [ $attempt -lt $max_attempts ]; do
    if nc -z localhost $port 2>/dev/null || lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo -e "${GREEN}✓ $service is ready on port $port${NC}"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  
  echo -e "${RED}✗ $service did not start on port $port${NC}"
  return 1
}

# Start Auth Service
echo -e "${YELLOW}[1/4] Starting Auth Service...${NC}"
npm run dev:auth > /tmp/auth-service.log 2>&1 &
AUTH_PID=$!
wait_for_port 3000 "Auth Service" || { echo "Auth Service failed"; kill $AUTH_PID 2>/dev/null; exit 1; }
echo ""

# Start Chatbot Service
echo -e "${YELLOW}[2/4] Starting Chatbot Service...${NC}"
npm run dev:chatbot > /tmp/chatbot-service.log 2>&1 &
CHATBOT_PID=$!
wait_for_port 3001 "Chatbot Service" || { echo "Chatbot Service failed"; kill $AUTH_PID $CHATBOT_PID 2>/dev/null; exit 1; }
echo ""

# Start Admin Service
echo -e "${YELLOW}[3/4] Starting Admin Service...${NC}"
npm run dev:admin > /tmp/admin-service.log 2>&1 &
ADMIN_PID=$!
wait_for_port 3002 "Admin Service" || { echo "Admin Service failed"; kill $AUTH_PID $CHATBOT_PID $ADMIN_PID 2>/dev/null; exit 1; }
echo ""

# Start Gateway
echo -e "${YELLOW}[4/4] Starting GraphQL Gateway...${NC}"
npm run dev:gateway > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
wait_for_port 4000 "GraphQL Gateway" || { echo "Gateway failed"; kill $AUTH_PID $CHATBOT_PID $ADMIN_PID $GATEWAY_PID 2>/dev/null; exit 1; }
echo ""

echo -e "${GREEN}✅ All backend services started successfully!${NC}"
echo ""
echo "Service PIDs:"
echo "  Auth Service:    $AUTH_PID (port 3000)"
echo "  Chatbot Service: $CHATBOT_PID (port 3001)"
echo "  Admin Service:   $ADMIN_PID (port 3002)"
echo "  Gateway:         $GATEWAY_PID (port 4000)"
echo ""
echo "Logs:"
echo "  Auth:    tail -f /tmp/auth-service.log"
echo "  Chatbot: tail -f /tmp/chatbot-service.log"
echo "  Admin:   tail -f /tmp/admin-service.log"
echo "  Gateway: tail -f /tmp/gateway.log"
echo ""
echo "To stop services: npm run kill:backend"
echo ""

wait
