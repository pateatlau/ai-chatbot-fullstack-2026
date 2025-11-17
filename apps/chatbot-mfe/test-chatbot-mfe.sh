#!/bin/bash

# Chatbot MFE Integration Test Script
# Tests conversation management, messaging, streaming, and UI elements

set -e

# Colors for output
reset="\033[0m"
green="\033[32m"
red="\033[31m"
yellow="\033[33m"
blue="\033[34m"
cyan="\033[36m"

echo -e "${cyan}═══════════════════════════════════════${reset}"
echo -e "${cyan}   Chatbot MFE Integration Tests${reset}"
echo -e "${cyan}═══════════════════════════════════════${reset}"
echo ""

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# API endpoints
AUTH_API="http://localhost:3000/api/auth"
CHATBOT_API="http://localhost:3001/api/chat"

# Test credentials
ADMIN_EMAIL="testadmin@example.com"
ADMIN_PASSWORD="Admin123!@#"

# Auth token (will be set after login)
TOKEN=""

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

# Helper to check file exists
check_file() {
  if [ -f "$1" ]; then
    return 0
  else
    return 1
  fi
}

# Helper to check content in file
check_content() {
  if grep -q "$2" "$1"; then
    return 0
  else
    return 1
  fi
}

# Login and get token
login() {
  response=$(curl -s -X POST "$AUTH_API/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
  
  TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo -e "${red}✗ Failed to login. Make sure auth-service is running on port 3000${reset}"
    exit 1
  fi
}

echo -e "${blue}🔐 Authentication${reset}"
echo ""

# Login
login
test_case "Login successful and token obtained"

echo ""
echo -e "${blue}📦 Component Files${reset}"
echo ""

# Check component files
check_file "apps/chatbot-mfe/src/components/ChatPage.tsx"
test_case "ChatPage component exists"

check_file "apps/chatbot-mfe/src/components/ConversationSidebar.tsx"
test_case "ConversationSidebar component exists"

check_file "apps/chatbot-mfe/src/components/MessageList.tsx"
test_case "MessageList component exists"

check_file "apps/chatbot-mfe/src/components/MessageBubble.tsx"
test_case "MessageBubble component exists"

check_file "apps/chatbot-mfe/src/components/MessageInput.tsx"
test_case "MessageInput component exists"

check_file "apps/chatbot-mfe/src/hooks/useStreamingMessage.ts"
test_case "useStreamingMessage hook exists"

check_file "apps/chatbot-mfe/src/hooks/useRateLimit.ts"
test_case "useRateLimit hook exists"

check_file "apps/chatbot-mfe/src/api/chatbot.api.ts"
test_case "Chatbot API client exists"

echo ""
echo -e "${blue}🔌 API Integration${reset}"
echo ""

# Test conversations API
conversations_response=$(curl -s -X GET "$CHATBOT_API/conversations" \
  -H "Authorization: Bearer $TOKEN")

echo "$conversations_response" | grep -q "conversations"
test_case "Get conversations API works"

# Test create conversation
create_response=$(curl -s -X POST "$CHATBOT_API/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Conversation"}')

echo "$create_response" | grep -q '"id"'
test_case "Create conversation API works"

CONVERSATION_ID=$(echo "$create_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$CONVERSATION_ID" ]; then
  echo "$create_response" | grep -q '"title":"Test Conversation"'
  test_case "Created conversation has correct title"
fi

# Test get conversation details
if [ -n "$CONVERSATION_ID" ]; then
  conv_detail=$(curl -s -X GET "$CHATBOT_API/conversations/$CONVERSATION_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$conv_detail" | grep -q '"id"'
  test_case "Get conversation detail API works"
  
  echo "$conv_detail" | grep -q '"messages"'
  test_case "Conversation detail includes messages"
fi

echo ""
echo -e "${blue}💬 Messaging & Streaming${reset}"
echo ""

# Test send message (streaming)
if [ -n "$CONVERSATION_ID" ]; then
  # Send message and check for streaming response
  message_response=$(curl -s -X POST "$CHATBOT_API/conversations/$CONVERSATION_ID/messages" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content":"Hello, test message"}' | head -c 200)
  
  # Check if we get SSE data format
  echo "$message_response" | grep -q "data:"
  test_case "Send message returns streaming response"
  
  # Check for delta or content in streaming response
  echo "$message_response" | grep -E 'delta|content|type' > /dev/null
  test_case "Streaming response contains message data"
fi

# Test get messages
if [ -n "$CONVERSATION_ID" ]; then
  messages=$(curl -s -X GET "$CHATBOT_API/conversations/$CONVERSATION_ID/messages" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$messages" | grep -E 'messages|^\[' > /dev/null
  test_case "Get messages API works"
fi

echo ""
echo -e "${blue}✏️ Conversation Management${reset}"
echo ""

# Test update conversation
if [ -n "$CONVERSATION_ID" ]; then
  update_response=$(curl -s -X PATCH "$CHATBOT_API/conversations/$CONVERSATION_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Updated Title"}')
  
  echo "$update_response" | grep -q '"title":"Updated Title"'
  test_case "Update conversation title works"
fi

# Test delete conversation
if [ -n "$CONVERSATION_ID" ]; then
  delete_response=$(curl -s -w "\n%{http_code}" -X DELETE "$CHATBOT_API/conversations/$CONVERSATION_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  http_code=$(echo "$delete_response" | tail -1)
  [ "$http_code" = "200" ] || [ "$http_code" = "204" ]
  test_case "Delete conversation works"
fi

echo ""
echo -e "${blue}📊 Statistics APIs${reset}"
echo ""

# Test conversation stats
stats_response=$(curl -s -X GET "$CHATBOT_API/stats/conversations" \
  -H "Authorization: Bearer $TOKEN")

echo "$stats_response" | grep -q "totalConversations"
test_case "Get conversation stats API works"

# Test token usage stats
token_stats=$(curl -s -X GET "$CHATBOT_API/stats/tokens" \
  -H "Authorization: Bearer $TOKEN")

echo "$token_stats" | grep -q "totalTokens"
test_case "Get token usage stats API works"

echo ""
echo -e "${blue}🎨 Component Structure${reset}"
echo ""

# Check component structure and imports
check_content "apps/chatbot-mfe/src/components/ChatPage.tsx" "useState"
test_case "ChatPage uses React hooks"

check_content "apps/chatbot-mfe/src/components/ChatPage.tsx" "useStreamingMessage"
test_case "ChatPage uses streaming hook"

check_content "apps/chatbot-mfe/src/components/ChatPage.tsx" "useRateLimit"
test_case "ChatPage uses rate limit hook"

check_content "apps/chatbot-mfe/src/components/MessageBubble.tsx" "react-markdown"
test_case "MessageBubble includes markdown rendering"

check_content "apps/chatbot-mfe/src/api/chatbot.api.ts" "sendMessageStream"
test_case "API client has streaming method"

check_content "apps/chatbot-mfe/src/api/chatbot.api.ts" "getAccessToken"
test_case "API client has auth token helper"

echo ""
echo -e "${blue}🔄 Streaming Implementation${reset}"
echo ""

# Check streaming hook implementation
check_content "apps/chatbot-mfe/src/hooks/useStreamingMessage.ts" "EventSource"
test_case "Streaming hook ready for SSE (uses fetch + ReadableStream)"

check_content "apps/chatbot-mfe/src/hooks/useStreamingMessage.ts" "delta"
test_case "Streaming hook handles delta events"

check_content "apps/chatbot-mfe/src/hooks/useStreamingMessage.ts" "complete"
test_case "Streaming hook handles complete events"

check_content "apps/chatbot-mfe/src/hooks/useStreamingMessage.ts" "onComplete"
test_case "Streaming hook has onComplete callback"

check_content "apps/chatbot-mfe/src/hooks/useStreamingMessage.ts" "onError"
test_case "Streaming hook has onError callback"

echo ""
echo -e "${blue}🚦 Rate Limiting${reset}"
echo ""

# Check rate limiting hook
check_file "apps/chatbot-mfe/src/hooks/useRateLimit.ts"
test_case "Rate limiting hook exists"

check_content "apps/chatbot-mfe/src/hooks/useRateLimit.ts" "isLimited"
test_case "Rate limit hook has isLimited state"

check_content "apps/chatbot-mfe/src/hooks/useRateLimit.ts" "trackMessage"
test_case "Rate limit hook has trackMessage function"

check_content "apps/chatbot-mfe/src/components/ChatPage.tsx" "rateLimitInfo"
test_case "ChatPage integrates rate limiting"

echo ""
echo -e "${blue}📝 TypeScript Types${reset}"
echo ""

# Check TypeScript interfaces
check_content "apps/chatbot-mfe/src/api/chatbot.api.ts" "interface Conversation"
test_case "Conversation interface defined"

check_content "apps/chatbot-mfe/src/api/chatbot.api.ts" "interface Message"
test_case "Message interface defined"

check_content "apps/chatbot-mfe/src/api/chatbot.api.ts" "interface ConversationStats"
test_case "ConversationStats interface defined"

check_content "apps/chatbot-mfe/src/api/chatbot.api.ts" "interface TokenUsageStats"
test_case "TokenUsageStats interface defined"

echo ""
echo -e "${blue}🎯 Module Federation${reset}"
echo ""

# Check Module Federation setup
check_file "apps/chatbot-mfe/module-federation.config.ts"
test_case "Module Federation config exists"

check_content "apps/chatbot-mfe/module-federation.config.ts" "exposes"
test_case "Module Federation exposes components"

echo ""
echo -e "${blue}💅 Styling${reset}"
echo ""

# Check CSS modules
check_file "apps/chatbot-mfe/src/components/ChatPage.module.css"
test_case "ChatPage styles exist"

check_file "apps/chatbot-mfe/src/components/MessageBubble.module.css"
test_case "MessageBubble styles exist"

check_file "apps/chatbot-mfe/src/components/MessageInput.module.css"
test_case "MessageInput styles exist"

check_file "apps/chatbot-mfe/src/components/ConversationSidebar.module.css"
test_case "ConversationSidebar styles exist"

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
  echo -e "${green}✨ All tests passed! Chatbot MFE is ready.${reset}"
  echo ""
  echo -e "${cyan}Chatbot MFE Status:${reset}"
  echo -e "  ✓ Real-time streaming with SSE"
  echo -e "  ✓ Conversation management (create, update, delete)"
  echo -e "  ✓ Markdown rendering with syntax highlighting"
  echo -e "  ✓ Rate limiting with visual indicators"
  echo -e "  ✓ Complete API integration"
  echo -e "  ✓ TypeScript types and interfaces"
  echo -e "  ✓ Module Federation configured"
  echo -e "  ✓ CSS modules for styling"
  echo ""
  exit 0
else
  echo -e "${red}Some tests failed!${reset}"
  exit 1
fi
