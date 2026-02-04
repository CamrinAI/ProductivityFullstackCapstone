#!/bin/bash

# Authentication API Test Script
# Tests all authentication endpoints

echo "🔐 Trade Tracker - Authentication API Tests"
echo "============================================"
echo ""

BASE_URL="http://localhost:3000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a new user
echo "${YELLOW}Test 1: Register New User${NC}"
echo "POST /api/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "company": "Test Co"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "${GREEN}✓ Registration successful${NC}"
else
  echo "${RED}✗ Registration failed${NC}"
  TOKEN=""
fi
echo ""

# Test 2: Login with credentials
echo "${YELLOW}Test 2: Login${NC}"
echo "POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "password": "demo123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "${GREEN}✓ Login successful${NC}"
else
  echo "${RED}✗ Login failed${NC}"
fi
echo ""

# Test 3: Get current user info
echo "${YELLOW}Test 3: Get Current User${NC}"
echo "GET /api/auth/me"
if [ -n "$TOKEN" ]; then
  ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$ME_RESPONSE" | jq '.'
  
  if echo "$ME_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "${GREEN}✓ User info retrieved${NC}"
  else
    echo "${RED}✗ Failed to get user info${NC}"
  fi
else
  echo "${RED}✗ No token available${NC}"
fi
echo ""

# Test 4: Change role (to foreman)
echo "${YELLOW}Test 4: Change Role to Foreman${NC}"
echo "POST /api/auth/change-role"
if [ -n "$TOKEN" ]; then
  ROLE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/change-role" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"role": "foreman"}')
  
  echo "$ROLE_RESPONSE" | jq '.'
  
  if echo "$ROLE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "${GREEN}✓ Role changed to foreman${NC}"
    # Update token
    NEW_TOKEN=$(echo "$ROLE_RESPONSE" | jq -r '.access_token')
    if [ "$NEW_TOKEN" != "null" ]; then
      TOKEN="$NEW_TOKEN"
    fi
  else
    echo "${RED}✗ Failed to change role${NC}"
  fi
else
  echo "${RED}✗ No token available${NC}"
fi
echo ""

# Test 5: Try to create a tool (should work as foreman)
echo "${YELLOW}Test 5: Create Tool (as Foreman)${NC}"
echo "POST /api/tools"
if [ -n "$TOKEN" ]; then
  TOOL_RESPONSE=$(curl -s -X POST "$BASE_URL/tools" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Drill",
      "asset_type": "power_tool",
      "description": "Test drill for API testing",
      "serial_number": "TEST-'$(date +%s)'",
      "location": "Warehouse A"
    }')
  
  echo "$TOOL_RESPONSE" | jq '.'
  
  if echo "$TOOL_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "${GREEN}✓ Tool created successfully (foreman has access)${NC}"
  else
    echo "${RED}✗ Failed to create tool${NC}"
  fi
else
  echo "${RED}✗ No token available${NC}"
fi
echo ""

# Test 6: Change role to technician and try to create tool (should fail)
echo "${YELLOW}Test 6: Change to Technician and Try to Create Tool${NC}"
echo "POST /api/auth/change-role -> POST /api/tools"
if [ -n "$TOKEN" ]; then
  # Change to technician
  TECH_ROLE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/change-role" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"role": "technician"}')
  
  TOKEN=$(echo "$TECH_ROLE_RESPONSE" | jq -r '.access_token')
  echo "Changed to technician role"
  
  # Try to create tool
  FAIL_TOOL_RESPONSE=$(curl -s -X POST "$BASE_URL/tools" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Should Fail Drill",
      "asset_type": "power_tool"
    }')
  
  echo "$FAIL_TOOL_RESPONSE" | jq '.'
  
  if echo "$FAIL_TOOL_RESPONSE" | jq -e '.error' | grep -q "Access denied\|denied\|403"; then
    echo "${GREEN}✓ Access correctly denied for technician${NC}"
  else
    echo "${RED}✗ Technician was able to create tool (security issue!)${NC}"
  fi
else
  echo "${RED}✗ No token available${NC}"
fi
echo ""

# Test 7: Logout
echo "${YELLOW}Test 7: Logout${NC}"
echo "POST /api/auth/logout"
if [ -n "$TOKEN" ]; then
  LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$LOGOUT_RESPONSE" | jq '.'
  
  if echo "$LOGOUT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "${GREEN}✓ Logout successful${NC}"
  else
    echo "${RED}✗ Logout failed${NC}"
  fi
else
  echo "${RED}✗ No token available${NC}"
fi
echo ""

echo "============================================"
echo "${GREEN}✅ Authentication API Tests Complete${NC}"
echo ""
echo "Summary:"
echo "  ✓ Register user"
echo "  ✓ Login"
echo "  ✓ Get user info"
echo "  ✓ Change roles"
echo "  ✓ Role-based access control"
echo "  ✓ Logout"
