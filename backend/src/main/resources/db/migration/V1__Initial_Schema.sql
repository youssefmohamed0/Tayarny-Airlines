-- V1__Initial_Schema.sql

-- 1. Create independent geographical tables
CREATE TABLE countries (
    country_code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(2) NOT NULL REFERENCES countries(country_code),
    name VARCHAR(255) NOT NULL
);

-- Note: Added iata_code to support your API design
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id),
    name VARCHAR(255) NOT NULL,
    iata_code VARCHAR(3) NOT NULL UNIQUE
);

-- 2. Create fleet tables
CREATE TABLE airplane_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    max_range_km INT NOT NULL
);

CREATE TABLE airplanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES airplane_models(id),
    condition VARCHAR(50) NOT NULL,
    number_of_flights INT NOT NULL DEFAULT 0
);

-- 3. Create core operational tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number VARCHAR(50) NOT NULL UNIQUE, -- ADDED: The commercial flight number
    origin_airport_id UUID NOT NULL REFERENCES airports(id),
    destination_airport_id UUID NOT NULL REFERENCES airports(id),
    airplane_id UUID NOT NULL REFERENCES airplanes(id),
    available_seats INT NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL
);

-- Note: Unique constraint ensures no duplicate seats on a single plane model
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES airplane_models(id),
    seat_num VARCHAR(10) NOT NULL,
    position VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    UNIQUE (model_id, seat_num)
);

-- 4. Create transaction tables
CREATE TABLE flight_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    flight_id UUID NOT NULL REFERENCES flights(id),
    num_seats INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL, -- ADDED: Total price of the reservation
    status VARCHAR(50) NOT NULL
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID NOT NULL REFERENCES flight_reservations(id) ON DELETE CASCADE,
    seat_num VARCHAR(10) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    passenger_type VARCHAR(50) NOT NULL,
    passport_number VARCHAR(100),
    passenger_name VARCHAR(255) NOT NULL
);