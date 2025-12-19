#!/bin/bash

# Test role registration with direct API call
echo "Testing user registration with ADMIN role via direct API call..."
echo ""

# Test with ADMIN role
API_URL="http://localhost:3000/api"
EMAIL="testadmin-$(date +%s)@example.com"

echo "Creating user with ADMIN role..."
echo "POST $API_URL/auth/register"
echo ""

curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "TestPass123!",
    "name": "Test Admin User",
    "role": "ADMIN"
  }' \
  -v

echo ""
echo ""
echo "Testing with empty role (should default to USER)..."
EMAIL2="testdefault-$(date +%s)@example.com"

curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL2'",
    "password": "TestPass123!",
    "name": "Test Default User",
    "role": ""
  }' \
  -v

echo ""
echo ""
echo "Checking logs for debug output..."
echo ""
echo "Auth Service Logs:"
tail -20 /tmp/auth-service.log | grep -E "\[REGISTER\]|\[AUTH_SERVICE\]"
