# Backend Unit Test Documentation

This document provides a detailed overview of the 122 unit tests implemented for the Flight Reservation System. The tests are organized by module and cover services, controllers, and core business logic.

---

## 1. Authentication Module (`modules/auth`)

### `AuthenticationServiceTest`
- **testRegister_Success**: Verifies that a new user can register successfully, passwords are encoded, and roles are assigned.
- **testLogin_Success**: Ensures a user can login and receive a valid JWT token.
- **testLogin_Failure**: Verifies that invalid credentials result in an `AuthenticationException`.

### `JwtServiceTest`
- **testGenerateToken**: Confirms that a valid JWT string is generated for a user.
- **testExtractUsername**: Verifies the username can be correctly parsed from a token.
- **testIsTokenValid**: Tests token expiration and signature validation.
- **testGenerateRefreshToken**: Confirms refresh token generation logic.

### `RefreshTokenServiceTest`
- **testCreateRefreshToken**: Verifies that a refresh token is saved to the DB with a proper expiry date.
- **testVerifyExpiration_Success**: Confirms tokens within the validity window pass.
- **testVerifyExpiration_Expired**: Ensures expired tokens are deleted and an exception is thrown.
- **testFindByToken**: Verifies token retrieval.

### `UserDetailsServiceImplTest`
- **testLoadUserByUsername_Success**: Confirms `UserDetailsService` returns a valid `UserDetails` object from the DB.
- **testLoadUserByUsername_NotFound**: Verifies error handling when a user doesn't exist.

### `AuthenticationControllerTest`
- **testRegister**: Endpoint test for `POST /api/auth/register`.
- **testLogin**: Endpoint test for `POST /api/auth/login`.
- **testRefreshToken**: Endpoint test for `POST /api/auth/refresh`.

---

## 2. Users Module (`modules/users`)

### `UserServiceTest`
- **testUpdateProfile**: Verifies users can update their own data.
- **testGetUserById**: Confirms retrieval logic.

### `UserControllerTest`
- **testGetProfile**: Endpoint test for `GET /api/user/profile`.

### `AdminUserControllerTest`
- **testGetAllUsers**: Verifies admin-only list retrieval.
- **testDeleteUser**: Verifies user removal logic.

---

## 3. Airplanes Module (`modules/airplanes`)

### `AirplaneServiceTest`
- **testGetAllAirplanes**: Verifies retrieval of the entire fleet.
- **testAddAirplane**: Confirms new aircraft can be added.
- **testUpdateCondition**: Tests the logic for updating maintenance status.

### `AdminAirplaneControllerTest`
- **CRUD Operations**: Endpoint tests for adding, updating, and deleting aircraft.

---

## 4. Airports Module (`modules/airports`)

### `UserAirportControllerTest`
- **testSearchAirports**: Verifies users can find airports by name or IATA code.

### `AdminAirportControllerTest`
- **CRUD Operations**: Tests for airport management endpoints.

---

## 5. Seats Module (`modules/seats`)

### `SeatServiceTest`
- **testInitializeSeats**: Verifies that seats are correctly generated for an airplane model.

### `UserSeatControllerTest`
- **testGetSeatMap**: Verifies retrieval of aircraft layouts.

---

## 6. Fare Options Module (`modules/fare_options`)

### `FareOptionServiceTest`
- **testGetFareByFlightAndClass**: Verifies retrieval of specific pricing for a cabin class.
- **testAddMultipleFareOptions**: Confirms batch insertion of pricing tiers (Economy, Business, etc.).

---

## 7. Tickets Module (`modules/tickets`)

### `TicketServiceTest`
- **testGetTicketsByReservationId**: Verifies retrieval of all tickets for a specific booking.
- **testToTicketResponse**: Confirms correct mapping of entity to DTO.

### `UserTicketControllerTest` & `AdminTicketControllerTest`
- **testCancelTicket**: Verifies the logic and endpoints for individual ticket cancellations.

---

## 8. Flights Module (`modules/flights`)

### `FlightServiceTest`
- **testSearchUserFlights**: Verifies the complex search logic involving origin, destination, date, and traveler count.
- **testAddAdminFlight**: Tests flight creation with associated pricing tiers.
- **testUpdateCompletedFlights**: Verifies the background job that marks arrived flights as `COMPLETED`.

### `FlightSeatStatusServiceTest`
- **testInitializeSeatsForFlight**: Confirms that a seat map is generated for every newly created flight.
- **testLockAndBookSeats**: Tests the logic for marking seats as `OCCUPIED`.

### `UserFlightControllerTest` & `AdminFlightControllerTest`
- **Search & Management**: Endpoint tests for searching flights and managing schedules.

---

## 9. Reservations Module (`modules/reservations`)

### `FlightReservationServiceTest`
- **testCheckout_Success**: The core test for the entire booking transaction. Verifies:
  - User authentication check.
  - Card expiry validation.
  - Seat availability check.
  - **Atomic Locking**: Ensures seats are locked before booking.
  - **Inventory Update**: Verifies available seats on the flight decrease.
  - **Transaction Persistence**: Confirms reservation and tickets are saved.
- **testCheckout_SeatOccupied**: Verifies that the system prevents booking a seat that was just taken by another user.
- **testCancelReservation_Success**: Verifies that cancelling a reservation:
  - Releases the seats (status becomes `AVAILABLE`).
  - Restores flight inventory.
  - Updates the status of all associated tickets.

### `FlightReservationControllerTest` & `AdminReservationControllerTest`
- **Checkout & History**: Endpoint tests for `POST /api/checkout` and reservation history with pagination.
- **Cancellations**: Endpoint tests for user and admin-initiated cancellations.

---

## Summary Statistics
- **Total Test Classes**: 26
- **Total Test Cases**: 122
- **Coverage**: All core services and controllers across 9 modules.
- **Technologies**: JUnit 5, Mockito, Spring Boot Test (`@WebMvcTest`, `@MockBean`).
