-- V2__Simplify_Schema.sql

-- =============================================================================
-- 1. Flatten airports: inline city and country as simple VARCHAR columns
-- =============================================================================
ALTER TABLE airports ADD COLUMN city VARCHAR(255);
ALTER TABLE airports ADD COLUMN country VARCHAR(255);

-- Migrate any existing data from the normalized tables
UPDATE airports a
SET city = c.name,
    country = co.name
FROM cities c
JOIN countries co ON c.country_code = co.country_code
WHERE a.city_id = c.id;

-- Now enforce NOT NULL (safe even if table is empty)
ALTER TABLE airports ALTER COLUMN city SET NOT NULL;
ALTER TABLE airports ALTER COLUMN country SET NOT NULL;

-- Drop the old foreign key column
ALTER TABLE airports DROP COLUMN city_id;

-- Drop the now-unused geography tables (cities references countries, so drop cities first)
DROP TABLE cities;
DROP TABLE countries;

-- =============================================================================
-- 2. Remove fare_option_id from tickets (one fare type per reservation, not per ticket)
-- =============================================================================
ALTER TABLE tickets DROP COLUMN fare_option_id;

-- =============================================================================
-- 3. Remove flight_id from flight_reservations (derived via fare_option → flight)
-- =============================================================================
ALTER TABLE flight_reservations DROP COLUMN flight_id;
