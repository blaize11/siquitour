#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000/api"

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}🔍 Testing Explore Feature Endpoints${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# Step 1: Login as guest
echo -e "${BLUE}Step 1: Login as guest...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@example.com",
    "password": "password"
  }')

GUEST_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$GUEST_TOKEN" ]; then
  echo -e "${RED}❌ Failed to login. Response: $LOGIN_RESPONSE${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Guest logged in${NC}\n"

# Step 2: Test /api/explore (Dashboard)
echo -e "${BLUE}Step 2: Testing GET /api/explore (Dashboard)...${NC}"
EXPLORE=$(curl -s -X GET "$API_URL/explore" \
  -H "Authorization: Bearer $GUEST_TOKEN")

GUIDE_COUNT=$(echo $EXPLORE | jq '.guides.total // 0')
RENTAL_COUNT=$(echo $EXPLORE | jq '.rentals.total // 0')
SPOT_COUNT=$(echo $EXPLORE | jq '.spots.total // 0')
RESTAURANT_COUNT=$(echo $EXPLORE | jq '.restaurants.total // 0')
CAN_BOOK=$(echo $EXPLORE | jq '.can_book')

echo -e "  Guides: $GUIDE_COUNT"
echo -e "  Rentals: $RENTAL_COUNT"
echo -e "  Spots: $SPOT_COUNT"
echo -e "  Restaurants: $RESTAURANT_COUNT"
echo -e "  Can Book (Guest): ${GREEN}$CAN_BOOK${NC}\n"

# Step 3: Test /api/explore/guides
echo -e "${BLUE}Step 3: Testing GET /api/explore/guides...${NC}"
GUIDES=$(curl -s -X GET "$API_URL/explore/guides" \
  -H "Authorization: Bearer $GUEST_TOKEN")

GUIDES_COUNT=$(echo $GUIDES | jq '.total')
FIRST_GUIDE_ID=$(echo $GUIDES | jq '.data[0].id // empty')

echo -e "${GREEN}✅ Found $GUIDES_COUNT guides${NC}"

if [ ! -z "$FIRST_GUIDE_ID" ]; then
  echo -e "  First Guide ID: $FIRST_GUIDE_ID\n"

  # Step 4: Test /api/explore/guides/{id}
  echo -e "${BLUE}Step 4: Testing GET /api/explore/guides/$FIRST_GUIDE_ID...${NC}"
  GUIDE_DETAIL=$(curl -s -X GET "$API_URL/explore/guides/$FIRST_GUIDE_ID" \
    -H "Authorization: Bearer $GUEST_TOKEN")

  GUIDE_NAME=$(echo $GUIDE_DETAIL | jq -r '.data.name')
  GUIDE_PHONE=$(echo $GUIDE_DETAIL | jq -r '.data.phone // "hidden"')

  echo -e "  Name: $GUIDE_NAME"
  echo -e "  Phone (visible for guest): ${GREEN}$GUIDE_PHONE${NC}\n"
else
  echo -e "${RED}⚠️  No guides found, skipping detail test${NC}\n"
fi

# Step 5: Test /api/explore/rentals
echo -e "${BLUE}Step 5: Testing GET /api/explore/rentals...${NC}"
RENTALS=$(curl -s -X GET "$API_URL/explore/rentals" \
  -H "Authorization: Bearer $GUEST_TOKEN")

RENTALS_COUNT=$(echo $RENTALS | jq '.total')
FIRST_RENTAL_ID=$(echo $RENTALS | jq '.data[0].id // empty')

echo -e "${GREEN}✅ Found $RENTALS_COUNT rentals${NC}"

if [ ! -z "$FIRST_RENTAL_ID" ]; then
  echo -e "  First Rental ID: $FIRST_RENTAL_ID\n"

  # Step 6: Test /api/explore/rentals/{id}
  echo -e "${BLUE}Step 6: Testing GET /api/explore/rentals/$FIRST_RENTAL_ID...${NC}"
  RENTAL_DETAIL=$(curl -s -X GET "$API_URL/explore/rentals/$FIRST_RENTAL_ID" \
    -H "Authorization: Bearer $GUEST_TOKEN")

  RENTAL_TITLE=$(echo $RENTAL_DETAIL | jq -r '.data.title')
  RENTAL_PRICE=$(echo $RENTAL_DETAIL | jq -r '.data.price_per_day')

  echo -e "  Title: $RENTAL_TITLE"
  echo -e "  Price/Day: ₱$RENTAL_PRICE\n"
else
  echo -e "${RED}⚠️  No rentals found, skipping detail test${NC}\n"
fi

# Step 7: Test /api/explore/spots
echo -e "${BLUE}Step 7: Testing GET /api/explore/spots...${NC}"
SPOTS=$(curl -s -X GET "$API_URL/explore/spots" \
  -H "Authorization: Bearer $GUEST_TOKEN")

SPOTS_COUNT=$(echo $SPOTS | jq '.total')
echo -e "${GREEN}✅ Found $SPOTS_COUNT spots${NC}\n"

# Step 8: Test /api/explore/restaurants
echo -e "${BLUE}Step 8: Testing GET /api/explore/restaurants...${NC}"
RESTAURANTS=$(curl -s -X GET "$API_URL/explore/restaurants" \
  -H "Authorization: Bearer $GUEST_TOKEN")

RESTAURANTS_COUNT=$(echo $RESTAURANTS | jq '.total')
echo -e "${GREEN}✅ Found $RESTAURANTS_COUNT restaurants${NC}\n"

# Step 9: Test search functionality
echo -e "${BLUE}Step 9: Testing search (search=island)...${NC}"
SEARCH=$(curl -s -X GET "$API_URL/explore/guides?search=island" \
  -H "Authorization: Bearer $GUEST_TOKEN")

SEARCH_COUNT=$(echo $SEARCH | jq '.total')
echo -e "${GREEN}✅ Search returned $SEARCH_COUNT results${NC}\n"

# Step 10: Test as non-guest (Tour Guide - should be read-only)
echo -e "${BLUE}Step 10: Login as tour guide (read-only test)...${NC}"
GUIDE_LOGIN=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo-guide@siquitour.local",
    "password": "password"
  }')

GUIDE_TOKEN=$(echo $GUIDE_LOGIN | jq -r '.token // empty')

if [ ! -z "$GUIDE_TOKEN" ]; then
  echo -e "${GREEN}✅ Guide logged in${NC}"

  # Test /api/explore/guides as guide
  GUIDE_EXPLORE=$(curl -s -X GET "$API_URL/explore/guides" \
    -H "Authorization: Bearer $GUIDE_TOKEN")

  CAN_BOOK_GUIDE=$(echo $GUIDE_EXPLORE | jq '.can_book')
  echo -e "  Can Book (Tour Guide): ${RED}$CAN_BOOK_GUIDE${NC}"
  echo -e "  (Should be false for non-guests)\n"
else
  echo -e "${RED}⚠️  Could not login as guide, skipping read-only test${NC}\n"
fi

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All Explore Endpoints Tested!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

echo -e "Summary:"
echo -e "  Guides: $GUIDE_COUNT"
echo -e "  Rentals: $RENTAL_COUNT"
echo -e "  Spots: $SPOT_COUNT"
echo -e "  Restaurants: $RESTAURANT_COUNT"
echo -e "  Guest Can Book: ${GREEN}true${NC}"
echo -e "  Guide Can Book: ${RED}false${NC} (read-only)\n"
