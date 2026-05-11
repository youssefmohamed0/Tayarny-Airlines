# Airplanes API

Base URL: http://localhost:9090

Authentication
- Admin endpoints require JWT with role ADMIN.
- User endpoints require JWT with role CUSTOMER.
- Test endpoints are open (dev only).

Data shape (AirplaneDto)
- id: UUID
- modelId: UUID
- modelName: string
- condition: string
- numberOfFlights: integer

Admin endpoints

1) List airplanes
- Method: GET
- Path: /api/admin/airplanes
- Query params (optional):
  - modelId: UUID
  - condition: string
- Response: 200 OK, array of AirplaneDto

Example
curl -sS http://localhost:9090/api/admin/airplanes \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

2) Get airplane by id
- Method: GET
- Path: /api/admin/airplanes/{id}
- Response:
  - 200 OK, AirplaneDto
  - 404 Not Found, "Airplane not found"

Example
curl -sS http://localhost:9090/api/admin/airplanes/40000000-0000-0000-0000-000000000001 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

3) Create airplane
- Method: POST
- Path: /api/admin/airplanes
- Body:
  - modelId: UUID (required)
  - condition: string (required)
  - numberOfFlights: integer (required)
- Response:
  - 201 Created, AirplaneDto
  - 400 Bad Request, error message

Example
curl -sS -X POST http://localhost:9090/api/admin/airplanes \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"modelId":"30000000-0000-0000-0000-000000000001","condition":"GOOD","numberOfFlights":0}'

4) Delete airplane
- Method: DELETE
- Path: /api/admin/airplanes/{id}
- Response:
  - 204 No Content
  - 404 Not Found, "Airplane not found"

Example
curl -i -X DELETE http://localhost:9090/api/admin/airplanes/40000000-0000-0000-0000-000000000001 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

User endpoints

5) List airplanes
- Method: GET
- Path: /api/user/airplanes
- Query params (optional):
  - modelId: UUID
  - condition: string
- Response: 200 OK, array of AirplaneDto

Example
curl -sS http://localhost:9090/api/user/airplanes \
  -H "Authorization: Bearer <USER_TOKEN>"

6) Get airplane by id
- Method: GET
- Path: /api/user/airplanes/{id}
- Response:
  - 200 OK, AirplaneDto
  - 404 Not Found, "Airplane not found"

Example
curl -sS http://localhost:9090/api/user/airplanes/40000000-0000-0000-0000-000000000001 \
  -H "Authorization: Bearer <USER_TOKEN>"

Test endpoints (dev only)

7) Ping
- Method: GET
- Path: /api/test/airplanes/ping
- Response: { "airplaneModels": number, "airplanes": number }

Example
curl -sS http://localhost:9090/api/test/airplanes/ping

8) List airplane models
- Method: GET
- Path: /api/test/airplanes/models
- Response: array of airplane model objects

Example
curl -sS http://localhost:9090/api/test/airplanes/models

9) Create airplane model
- Method: POST
- Path: /api/test/airplanes/models
- Body:
  - modelName: string (required)
  - capacity: integer (required)
  - maxRangeKm: integer (required)
- Response:
  - 201 Created, airplane model object
  - 400 Bad Request, error message

Example
curl -sS -X POST http://localhost:9090/api/test/airplanes/models \
  -H "Content-Type: application/json" \
  -d '{"modelName":"Test A320","capacity":150,"maxRangeKm":6100}'

10) List airplanes
- Method: GET
- Path: /api/test/airplanes
- Query params (optional):
  - modelId: UUID
  - condition: string
- Response: 200 OK, array of AirplaneDto

Example
curl -sS http://localhost:9090/api/test/airplanes

11) Create airplane
- Method: POST
- Path: /api/test/airplanes
- Body:
  - modelId: UUID (required)
  - condition: string (required)
  - numberOfFlights: integer (required)
- Response:
  - 201 Created, AirplaneDto
  - 404 Not Found, "AirplaneModel not found: <id>"

Example
curl -sS -X POST http://localhost:9090/api/test/airplanes \
  -H "Content-Type: application/json" \
  -d '{"modelId":"30000000-0000-0000-0000-000000000001","condition":"GOOD","numberOfFlights":0}'
