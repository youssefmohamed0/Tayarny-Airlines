-- V4__Add_Indexes.sql

-- =============================================================================
-- Indexes for city-to-city flight search
-- =============================================================================

-- Step 1 of search: find all airport IDs in the origin/destination city
-- The search query JOINs airports ON city + country, so this index is critical
CREATE INDEX idx_airports_city_country ON airports (city, country);

-- Step 2 of search: find flights between those airports within a date range
-- Covers: WHERE origin_airport_id = ? AND destination_airport_id = ? AND departure_time BETWEEN ? AND ?
CREATE INDEX idx_flights_origin_dest_departure ON flights (origin_airport_id, destination_airport_id, departure_time);

-- =============================================================================
-- Foreign key indexes (PostgreSQL does NOT auto-index FKs)
-- =============================================================================

-- Fetch fare options for a flight (flight detail page, search results)
CREATE INDEX idx_fare_options_flight_id ON fare_options (flight_id);

-- User booking history: findByUserId(), findByUserIdOrderBy...()
CREATE INDEX idx_flight_reservations_user_id ON flight_reservations (user_id);

-- Load tickets for a reservation: findByReservationId()
CREATE INDEX idx_tickets_reservation_id ON tickets (reservation_id);

-- Logout / token cleanup: deleteByUser()
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- =============================================================================
-- JOIN performance
-- =============================================================================

-- Flight → airplane → model → seats chain (used in seat map queries)
CREATE INDEX idx_flights_airplane_id ON flights (airplane_id);
