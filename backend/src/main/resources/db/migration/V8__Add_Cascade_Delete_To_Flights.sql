-- V8__Add_Cascade_Delete_To_Flights.sql

-- 1. fare_options -> flights
ALTER TABLE fare_options 
DROP CONSTRAINT IF EXISTS fare_options_flight_id_fkey;

ALTER TABLE fare_options 
ADD CONSTRAINT fare_options_flight_id_fkey 
FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE;

-- 2. flight_seat_status -> flights
ALTER TABLE flight_seat_status 
DROP CONSTRAINT IF EXISTS flight_seat_status_flight_id_fkey;

ALTER TABLE flight_seat_status 
ADD CONSTRAINT flight_seat_status_flight_id_fkey 
FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE;

-- 3. flight_reservations -> fare_options
ALTER TABLE flight_reservations 
DROP CONSTRAINT IF EXISTS flight_reservations_fare_option_id_fkey;

ALTER TABLE flight_reservations 
ADD CONSTRAINT flight_reservations_fare_option_id_fkey 
FOREIGN KEY (fare_option_id) REFERENCES fare_options(id) ON DELETE CASCADE;

-- Note: tickets.reservation_id already has ON DELETE CASCADE from V1.

-- Execute bulk deletion for flights starting from June 2026.
-- Due to ON DELETE CASCADE, this will safely delete the corresponding 
-- fare_options, flight_seat_status, flight_reservations, and tickets.
DELETE FROM flights WHERE departure_time >= '2026-06-01 00:00:00';
