#!/bin/bash

# This script tests the role registration directly via REST API
# Run this after starting the auth service to verify backend is working correctly

set -e

API_URL="http://localhost:3000/api"

echo "================================================"
echo "Testing User Role Registration - REST API"
echo "================================================"
echo ""

# Test 1: Register with ADMIN role
echo "Test 1: Register user with ADMIN role"
echo "========================================"
EMAIL1="testadmin$(date +%s)@example.com"
RESPONSE1=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL1'",
    "password": "TestPass123!",
    "name": "Admin Test User",
    "role": "ADMIN"
  }')

echo "Request Email: $EMAIL1"
echo "Request Role: ADMIN"
echo "Response:"
echo "$RESPONSE1" | jq .
ROLE1=$(echo "$RESPONSE1" | jq -r '.user.role // "NOT_FOUND"')
echo "✅ Response contains role: $ROLE1"
echo ""

# Test 2: Register with USER role
echo "Test 2: Register user with USER role"
echo "====================================="
EMAIL2="testuser$(date +%s)@example.com"
RESPONSE2=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL2'",
    "password": "TestPass123!",
    "name": "User Test User",
    "role": "USER"
  }')

echo "Request Email: $EMAIL2"
echo "Request Role: USER"
echo "Response:"
echo "$RESPONSE2" | jq .
ROLE2=$(echo "$RESPONSE2" | jq -r '.user.role // "NOT_FOUND"')
echo "✅ Response contains role: $ROLE2"
echo ""

# Test 3: Register with empty role (should default to USER)
echo "Test 3: Register user with empty role (should default to USER)"
echo "=============================================================="
EMAIL3="testdefault$(date +%s)@example.com"
RESPONSE3=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL3'",
    "password": "TestPass123!",
    "name": "Default Test User",
    "role": ""
  }')

echo "Request Email: $EMAIL3"
echo "Request Role: \"\" (empty string)"
echo "Response:"
echo "$RESPONSE3" | jq .
ROLE3=$(echo "$RESPONSE3" | jq -r '.user.role // "NOT_FOUND"')
echo "✅ Response contains role: $ROLE3"
echo ""

# Summary
echo "================================================"
echo "SUMMARY"
echo "================================================"
echo "Test 1 (ADMIN):   Expected=ADMIN, Got=$ROLE1"
if [ "$ROLE1" = "ADMIN" ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi
echo ""
echo "Test 2 (USER):    Expected=USER, Got=$ROLE2"
if [ "$ROLE2" = "USER" ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi
echo ""
echo "Test 3 (DEFAULT): Expected=USER, Got=$ROLE3"
if [ "$ROLE3" = "USER" ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi
echo ""
echo "If all tests PASS, the REST endpoint is working correctly."
echo "If any test FAILS, the backend needs investigation."
echo ""
echo "Note: Check /tmp/auth-service.log for debug logs with [REGISTER] prefix"
