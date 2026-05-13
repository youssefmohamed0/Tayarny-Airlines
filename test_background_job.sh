#!/bin/bash

BASE="http://localhost:9090"

echo "=== 1. Login as customer (johndoe) ==="
CUSTOMER_RESPONSE=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"John@123"}')
TOKEN=$(echo "$CUSTOMER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
echo "Customer token: ${TOKEN:0:20}..."

echo ""
echo "=== 2. Checkout: johndoe books 1 seat on Cairo->London (MS777, Economy) ==="
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
        "assignedSeat": "5A"
      }
    ],
    "creditCardNumber": "4111111111111111",
    "cardExpiryDate": "12/2027"
  }')
NEW_RES_ID=$(echo "$CHECKOUT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "New reservation ID: $NEW_RES_ID"

echo ""
echo "=== 3. Force flight MS777 arrival_time to 1 hour ago in Postgres ==="
docker exec flight_booking_db psql -U postgres -d flight_booking_db -c "UPDATE flights SET arrival_time = NOW() - INTERVAL '1 hour' WHERE flight_number = 'MS777';"

echo ""
echo "=== 4. Waiting for the Background Job (up to 120 seconds) ==="
echo "The job runs every 2 minutes. Polling every 5 seconds..."

MAX_WAIT=120
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    RES_STATUS=$(curl -s -X GET "$BASE/api/user/reservations/$NEW_RES_ID" \
      -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null)
    
    if [ "$RES_STATUS" == "COMPLETED" ]; then
        echo "✅ SUCCESS! The background job updated the flight and the trigger cascaded 'COMPLETED' to the reservation!"
        exit 0
    fi
    
    echo "Current status is: $RES_STATUS ... waiting 5s"
    sleep 5
    WAITED=$((WAITED + 5))
done

echo "❌ FAILED! The reservation status did not update to COMPLETED within 120 seconds."
exit 1
