#!/bin/bash
# M4 API Test Script — run each section sequentially
# Assumes backend is running at localhost:8080

BASE="http://localhost:9090"

echo "=== 1. Login as customer (johndoe) ==="
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"John@123"}')
echo "$CUSTOMER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CUSTOMER_RESPONSE"
TOKEN=$(echo "$CUSTOMER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
echo "Customer token: ${TOKEN:0:20}..."

echo ""
echo "=== 2. Login as admin ==="
ADMIN_RESPONSE=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}')
echo "$ADMIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ADMIN_RESPONSE"
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
echo "Admin token: ${ADMIN_TOKEN:0:20}..."

echo ""
echo "=== 3. Checkout: johndoe books 2 seats on Cairo->London (MS777, Economy) ==="
CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "flightNumber": "MS777",
    "fareClass": "ECONOMY",
    "travelers": [
      {
        "type": "ADULT",
        "fullName": "John Doe",
        "passportNumber": "A12345678",
        "dateOfBirth": "1990-05-15",
        "assignedSeat": "3A"
      },
      {
        "type": "CHILD",
        "fullName": "Emily Doe",
        "dateOfBirth": "2018-08-20",
        "assignedSeat": "3B"
      }
    ],
    "creditCardNumber": "4111111111111111",
    "cardExpiryDate": "12/2027"
  }')
echo "$CHECKOUT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHECKOUT_RESPONSE"
NEW_RES_ID=$(echo "$CHECKOUT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "New reservation ID: $NEW_RES_ID"

echo ""
echo "=== 4. Get my reservations (johndoe history — should include seed data + new booking) ==="
curl -s -X GET "$BASE/api/user/reservations" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== 5. Get single reservation detail ==="
curl -s -X GET "$BASE/api/user/reservations/$NEW_RES_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== 6. Get tickets for reservation ==="
curl -s -X GET "$BASE/api/user/reservations/$NEW_RES_ID/tickets" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== 7. Cancel the reservation ==="
curl -s -X PUT "$BASE/api/user/reservations/$NEW_RES_ID/cancel" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== 8. Verify cancellation — status should be CANCELLED ==="
curl -s -X GET "$BASE/api/user/reservations/$NEW_RES_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== 9. Try booking same seats again (should work since we cancelled) ==="
curl -s -X POST "$BASE/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "flightNumber": "MS777",
    "fareClass": "ECONOMY",
    "travelers": [
      {
        "type": "ADULT",
        "fullName": "John Doe",
        "passportNumber": "A12345678",
        "assignedSeat": "3A"
      }
    ],
    "creditCardNumber": "4111111111111111",
    "cardExpiryDate": "12/2027"
  }' | python3 -m json.tool

echo ""
echo "=== 10. Try expired card (should fail) ==="
curl -s -X POST "$BASE/api/checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "flightNumber": "MS201",
    "fareClass": "ECONOMY",
    "travelers": [
      {
        "type": "ADULT",
        "fullName": "Test User",
        "passportNumber": "X999",
        "assignedSeat": "4A"
      }
    ],
    "creditCardNumber": "4111111111111111",
    "cardExpiryDate": "01/2020"
  }'

echo ""
echo "=== 11. Admin: get all reservations ==="
curl -s -X GET "$BASE/api/admin/reservations" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

echo ""
echo "=== 12. Admin: get all tickets ==="
curl -s -X GET "$BASE/api/admin/tickets" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

echo ""
echo "=== Done! ==="
