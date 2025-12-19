#!/bin/bash

# Test Authentication Token Forwarding Flow
echo "🔍 Testing Authentication Token Forwarding..."
echo ""

# 1. Try login to get a token
echo "📝 Step 1: Attempting login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { token user { id email name role } } }",
    "variables": {
      "input": {
        "email": "test@example.com",
        "password": "password123"
      }
    }
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.login.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Got token: ${TOKEN:0:20}..."
  echo ""

  # 2. Test GetConversations with token
  echo "📝 Step 2: Testing GetConversations with Authorization header..."
  CONVERSATIONS_RESPONSE=$(curl -s -X POST http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "query": "query GetConversations { conversations { id title userId createdAt } }"
    }')

  echo "GetConversations Response:"
  echo "$CONVERSATIONS_RESPONSE" | jq . 2>/dev/null || echo "$CONVERSATIONS_RESPONSE"
  echo ""

  # Check if we got an authentication error
  if echo "$CONVERSATIONS_RESPONSE" | grep -q "UNAUTHENTICATED\|Not authenticated"; then
    echo "❌ Authentication error! Token not recognized by gateway."
  elif echo "$CONVERSATIONS_RESPONSE" | grep -q "errors"; then
    echo "⚠️  Error in response (check details above)"
  else
    echo "✅ Query successful!"
  fi

else
  echo "❌ Failed to get token from login response"
  echo "This could mean:"
  echo "  1. Auth service is not running"
  echo "  2. Test user doesn't exist (need to create one)"
  echo "  3. Login mutation has errors"
fi
