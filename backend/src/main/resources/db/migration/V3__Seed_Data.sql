-- V3__Seed_Data.sql
-- Realistic test/demo data for the Flight Reservation System

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- USERS (passwords hashed with BCrypt via pgcrypto)
-- =============================================================================
INSERT INTO users (id, email, username, hashed_password, full_name, role) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@flightbooking.com',  'admin',        crypt('Admin@123',  gen_salt('bf', 10)), 'System Administrator', 'ADMIN'),
('10000000-0000-0000-0000-000000000002', 'john.doe@email.com',       'johndoe',      crypt('John@123',   gen_salt('bf', 10)), 'John Doe',             'CUSTOMER'),
('10000000-0000-0000-0000-000000000003', 'jane.smith@email.com',     'janesmith',    crypt('Jane@123',   gen_salt('bf', 10)), 'Jane Smith',           'CUSTOMER'),
('10000000-0000-0000-0000-000000000004', 'ahmed.hassan@email.com',   'ahmedhassan',  crypt('Ahmed@123',  gen_salt('bf', 10)), 'Ahmed Hassan',         'CUSTOMER'),
('10000000-0000-0000-0000-000000000005', 'sara.ali@email.com',       'saraali',      crypt('Sara@123',   gen_salt('bf', 10)), 'Sara Ali',             'CUSTOMER');

-- =============================================================================
-- AIRPORTS
-- =============================================================================
INSERT INTO airports (id, name, iata_code, city, country) VALUES
('20000000-0000-0000-0000-000000000001', 'Cairo International Airport',            'CAI', 'Cairo',          'Egypt'),
('20000000-0000-0000-0000-000000000002', 'London Heathrow Airport',                'LHR', 'London',         'United Kingdom'),
('20000000-0000-0000-0000-000000000003', 'Dubai International Airport',            'DXB', 'Dubai',          'United Arab Emirates'),
('20000000-0000-0000-0000-000000000004', 'John F. Kennedy International Airport',  'JFK', 'New York',       'United States'),
('20000000-0000-0000-0000-000000000005', 'Charles de Gaulle Airport',              'CDG', 'Paris',          'France'),
('20000000-0000-0000-0000-000000000006', 'Istanbul Airport',                       'IST', 'Istanbul',       'Turkey'),
('20000000-0000-0000-0000-000000000007', 'Frankfurt Airport',                      'FRA', 'Frankfurt',      'Germany'),
('20000000-0000-0000-0000-000000000008', 'Sharm El-Sheikh International Airport',  'SSH', 'Sharm El-Sheikh', 'Egypt');

-- =============================================================================
-- AIRPLANE MODELS
-- =============================================================================
INSERT INTO airplane_models (id, model_name, capacity, max_range_km) VALUES
('30000000-0000-0000-0000-000000000001', 'Airbus A320neo',    180,  6300),
('30000000-0000-0000-0000-000000000002', 'Boeing 777-300ER',  396, 13650);

-- =============================================================================
-- AIRPLANES
-- =============================================================================
INSERT INTO airplanes (id, model_id, condition, number_of_flights) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'EXCELLENT', 150),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'GOOD',      320),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'EXCELLENT',  85),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'GOOD',      210);

-- =============================================================================
-- SEATS  (A=WINDOW B=MIDDLE C=AISLE | D=AISLE E=MIDDLE F=WINDOW)
--   Model 1 (A320neo):    rows 1-2 BUSINESS, rows 3-5 ECONOMY  → 30 seats
--   Model 2 (777-300ER):  rows 1-2 BUSINESS, rows 3-5 ECONOMY  → 30 seats
-- =============================================================================

-- Helper: generate seats for a model with given rows/class
-- Model 1 – Airbus A320neo
INSERT INTO seats (id, model_id, seat_num, position, class) VALUES
-- Row 1 BUSINESS
('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','1A','WINDOW','BUSINESS'),
('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','1B','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','1C','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','1D','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001','1E','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001','1F','WINDOW','BUSINESS'),
-- Row 2 BUSINESS
('50000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001','2A','WINDOW','BUSINESS'),
('50000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000001','2B','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000001','2C','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000001','2D','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000001','2E','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000012','30000000-0000-0000-0000-000000000001','2F','WINDOW','BUSINESS'),
-- Row 3 ECONOMY
('50000000-0000-0000-0000-000000000013','30000000-0000-0000-0000-000000000001','3A','WINDOW','ECONOMY'),
('50000000-0000-0000-0000-000000000014','30000000-0000-0000-0000-000000000001','3B','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000015','30000000-0000-0000-0000-000000000001','3C','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000016','30000000-0000-0000-0000-000000000001','3D','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000017','30000000-0000-0000-0000-000000000001','3E','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000018','30000000-0000-0000-0000-000000000001','3F','WINDOW','ECONOMY'),
-- Row 4 ECONOMY
('50000000-0000-0000-0000-000000000019','30000000-0000-0000-0000-000000000001','4A','WINDOW','ECONOMY'),
('50000000-0000-0000-0000-000000000020','30000000-0000-0000-0000-000000000001','4B','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000021','30000000-0000-0000-0000-000000000001','4C','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000022','30000000-0000-0000-0000-000000000001','4D','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000023','30000000-0000-0000-0000-000000000001','4E','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000024','30000000-0000-0000-0000-000000000001','4F','WINDOW','ECONOMY'),
-- Row 5 ECONOMY
('50000000-0000-0000-0000-000000000025','30000000-0000-0000-0000-000000000001','5A','WINDOW','ECONOMY'),
('50000000-0000-0000-0000-000000000026','30000000-0000-0000-0000-000000000001','5B','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000027','30000000-0000-0000-0000-000000000001','5C','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000028','30000000-0000-0000-0000-000000000001','5D','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000029','30000000-0000-0000-0000-000000000001','5E','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000030','30000000-0000-0000-0000-000000000001','5F','WINDOW','ECONOMY');

-- Model 2 – Boeing 777-300ER
INSERT INTO seats (id, model_id, seat_num, position, class) VALUES
-- Row 1 BUSINESS
('50000000-0000-0000-0000-000000000031','30000000-0000-0000-0000-000000000002','1A','WINDOW','BUSINESS'),
('50000000-0000-0000-0000-000000000032','30000000-0000-0000-0000-000000000002','1B','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000033','30000000-0000-0000-0000-000000000002','1C','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000034','30000000-0000-0000-0000-000000000002','1D','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000035','30000000-0000-0000-0000-000000000002','1E','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000036','30000000-0000-0000-0000-000000000002','1F','WINDOW','BUSINESS'),
-- Row 2 BUSINESS
('50000000-0000-0000-0000-000000000037','30000000-0000-0000-0000-000000000002','2A','WINDOW','BUSINESS'),
('50000000-0000-0000-0000-000000000038','30000000-0000-0000-0000-000000000002','2B','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000039','30000000-0000-0000-0000-000000000002','2C','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000040','30000000-0000-0000-0000-000000000002','2D','AISLE','BUSINESS'),
('50000000-0000-0000-0000-000000000041','30000000-0000-0000-0000-000000000002','2E','MIDDLE','BUSINESS'),
('50000000-0000-0000-0000-000000000042','30000000-0000-0000-0000-000000000002','2F','WINDOW','BUSINESS'),
-- Row 3 ECONOMY
('50000000-0000-0000-0000-000000000043','30000000-0000-0000-0000-000000000002','3A','WINDOW','ECONOMY'),
('50000000-0000-0000-0000-000000000044','30000000-0000-0000-0000-000000000002','3B','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000045','30000000-0000-0000-0000-000000000002','3C','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000046','30000000-0000-0000-0000-000000000002','3D','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000047','30000000-0000-0000-0000-000000000002','3E','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000048','30000000-0000-0000-0000-000000000002','3F','WINDOW','ECONOMY'),
-- Row 4 ECONOMY
('50000000-0000-0000-0000-000000000049','30000000-0000-0000-0000-000000000002','4A','WINDOW','ECONOMY'),
('50000000-0000-0000-0000-000000000050','30000000-0000-0000-0000-000000000002','4B','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000051','30000000-0000-0000-0000-000000000002','4C','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000052','30000000-0000-0000-0000-000000000002','4D','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000053','30000000-0000-0000-0000-000000000002','4E','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000054','30000000-0000-0000-0000-000000000002','4F','WINDOW','ECONOMY'),
-- Row 5 ECONOMY
('50000000-0000-0000-0000-000000000055','30000000-0000-0000-0000-000000000002','5A','WINDOW','ECONOMY'),
('50000000-0000-0000-0000-000000000056','30000000-0000-0000-0000-000000000002','5B','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000057','30000000-0000-0000-0000-000000000002','5C','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000058','30000000-0000-0000-0000-000000000002','5D','AISLE','ECONOMY'),
('50000000-0000-0000-0000-000000000059','30000000-0000-0000-0000-000000000002','5E','MIDDLE','ECONOMY'),
('50000000-0000-0000-0000-000000000060','30000000-0000-0000-0000-000000000002','5F','WINDOW','ECONOMY');

-- =============================================================================
-- FLIGHTS  (using NOW() + intervals so dates are always in the future)
-- =============================================================================
INSERT INTO flights (id, flight_number, origin_airport_id, destination_airport_id, airplane_id, departure_time, arrival_time, status, terminal) VALUES
-- Cairo → London  (A320neo, ~5h flight)
('60000000-0000-0000-0000-000000000001', 'MS777',
 '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000001',
 NOW() + INTERVAL '3 days' + INTERVAL '8 hours',
 NOW() + INTERVAL '3 days' + INTERVAL '13 hours',
 'SCHEDULED', 'T3'),

-- Cairo → Dubai  (A320neo, ~3.5h flight)
('60000000-0000-0000-0000-000000000002', 'MS201',
 '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003',
 '40000000-0000-0000-0000-000000000002',
 NOW() + INTERVAL '5 days' + INTERVAL '10 hours',
 NOW() + INTERVAL '5 days' + INTERVAL '13 hours' + INTERVAL '30 minutes',
 'SCHEDULED', 'T2'),

-- London → New York  (777-300ER, ~8h flight)
('60000000-0000-0000-0000-000000000003', 'BA115',
 '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004',
 '40000000-0000-0000-0000-000000000003',
 NOW() + INTERVAL '7 days' + INTERVAL '9 hours',
 NOW() + INTERVAL '7 days' + INTERVAL '17 hours',
 'SCHEDULED', 'T5'),

-- Dubai → Istanbul  (777-300ER, ~4.5h flight)
('60000000-0000-0000-0000-000000000004', 'EK731',
 '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006',
 '40000000-0000-0000-0000-000000000004',
 NOW() + INTERVAL '4 days' + INTERVAL '14 hours',
 NOW() + INTERVAL '4 days' + INTERVAL '18 hours' + INTERVAL '30 minutes',
 'SCHEDULED', 'T1'),

-- Paris → Frankfurt  (A320neo, ~1.5h flight)
('60000000-0000-0000-0000-000000000005', 'AF1118',
 '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000007',
 '40000000-0000-0000-0000-000000000001',
 NOW() + INTERVAL '10 days' + INTERVAL '7 hours',
 NOW() + INTERVAL '10 days' + INTERVAL '8 hours' + INTERVAL '30 minutes',
 'SCHEDULED', 'T2E'),

-- Cairo → Sharm El-Sheikh  (A320neo, ~1h flight)
('60000000-0000-0000-0000-000000000006', 'MS137',
 '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008',
 '40000000-0000-0000-0000-000000000002',
 NOW() + INTERVAL '2 days' + INTERVAL '6 hours',
 NOW() + INTERVAL '2 days' + INTERVAL '7 hours',
 'SCHEDULED', 'T1');

-- =============================================================================
-- FARE OPTIONS  (2 per flight: economy + business)
-- =============================================================================
INSERT INTO fare_options (id, flight_id, fare_name, cabin_class, price_per_adult, price_per_child, available_seats, benefits) VALUES
-- Flight 1: Cairo → London
('70000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Economy Standard','ECONOMY', 350.00, 250.00, 18, ARRAY['23kg baggage','Meal included']),
('70000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001','Business Flex',   'BUSINESS',1200.00, 900.00, 12, ARRAY['40kg baggage','Lounge access','Priority boarding','Full refund']),
-- Flight 2: Cairo → Dubai
('70000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000002','Economy Standard','ECONOMY', 280.00, 200.00, 18, ARRAY['23kg baggage','Meal included']),
('70000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000002','Business Flex',   'BUSINESS', 950.00, 700.00, 12, ARRAY['40kg baggage','Lounge access','Priority boarding','Full refund']),
-- Flight 3: London → New York
('70000000-0000-0000-0000-000000000005','60000000-0000-0000-0000-000000000003','Economy Standard','ECONOMY', 550.00, 400.00, 18, ARRAY['23kg baggage','Meal included','Entertainment']),
('70000000-0000-0000-0000-000000000006','60000000-0000-0000-0000-000000000003','Business Flex',   'BUSINESS',2800.00,2100.00, 12, ARRAY['40kg baggage','Lounge access','Lie-flat seat','Full refund']),
-- Flight 4: Dubai → Istanbul
('70000000-0000-0000-0000-000000000007','60000000-0000-0000-0000-000000000004','Economy Standard','ECONOMY', 320.00, 230.00, 18, ARRAY['30kg baggage','Meal included','Entertainment']),
('70000000-0000-0000-0000-000000000008','60000000-0000-0000-0000-000000000004','Business Flex',   'BUSINESS',1100.00, 800.00, 12, ARRAY['40kg baggage','Lounge access','Priority boarding','Full refund']),
-- Flight 5: Paris → Frankfurt
('70000000-0000-0000-0000-000000000009','60000000-0000-0000-0000-000000000005','Economy Standard','ECONOMY', 120.00,  85.00, 18, ARRAY['23kg baggage','Snack']),
('70000000-0000-0000-0000-000000000010','60000000-0000-0000-0000-000000000005','Business Flex',   'BUSINESS', 450.00, 330.00, 12, ARRAY['40kg baggage','Lounge access','Full refund']),
-- Flight 6: Cairo → Sharm El-Sheikh
('70000000-0000-0000-0000-000000000011','60000000-0000-0000-0000-000000000006','Economy Standard','ECONOMY',  90.00,  65.00, 18, ARRAY['20kg baggage']),
('70000000-0000-0000-0000-000000000012','60000000-0000-0000-0000-000000000006','Business Flex',   'BUSINESS', 300.00, 220.00, 12, ARRAY['30kg baggage','Lounge access','Priority boarding']);

-- =============================================================================
-- FLIGHT SEAT STATUS  (auto-join: every seat of the flight's airplane model)
-- =============================================================================
INSERT INTO flight_seat_status (flight_id, seat_id, status)
SELECT f.id, s.id, 'AVAILABLE'
FROM flights f
JOIN airplanes a ON f.airplane_id = a.id
JOIN seats s ON s.model_id = a.model_id;

-- =============================================================================
-- PAST FLIGHTS  (for testing flight history)
-- =============================================================================
INSERT INTO flights (id, flight_number, origin_airport_id, destination_airport_id, airplane_id, departure_time, arrival_time, status, terminal) VALUES
-- Past: Cairo → Dubai, 15 days ago (A320neo)
('60000000-0000-0000-0000-000000000101', 'MS203',
 '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003',
 '40000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '15 days' + INTERVAL '8 hours',
 NOW() - INTERVAL '15 days' + INTERVAL '11 hours' + INTERVAL '30 minutes',
 'COMPLETED', 'T2'),

-- Past: London → Paris, 30 days ago (A320neo)
('60000000-0000-0000-0000-000000000102', 'BA304',
 '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005',
 '40000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '30 days' + INTERVAL '14 hours',
 NOW() - INTERVAL '30 days' + INTERVAL '15 hours' + INTERVAL '20 minutes',
 'COMPLETED', 'T5'),

-- Past: Dubai → London, 45 days ago (777-300ER)
('60000000-0000-0000-0000-000000000103', 'EK029',
 '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002',
 '40000000-0000-0000-0000-000000000003',
 NOW() - INTERVAL '45 days' + INTERVAL '3 hours',
 NOW() - INTERVAL '45 days' + INTERVAL '10 hours',
 'COMPLETED', 'T3');

-- Fare options for past flights
INSERT INTO fare_options (id, flight_id, fare_name, cabin_class, price_per_adult, price_per_child, available_seats, benefits) VALUES
('70000000-0000-0000-0000-000000000101','60000000-0000-0000-0000-000000000101','Economy Standard','ECONOMY', 280.00, 200.00, 16, ARRAY['23kg baggage','Meal included']),
('70000000-0000-0000-0000-000000000102','60000000-0000-0000-0000-000000000101','Business Flex',   'BUSINESS', 950.00, 700.00, 11, ARRAY['40kg baggage','Lounge access','Priority boarding']),
('70000000-0000-0000-0000-000000000103','60000000-0000-0000-0000-000000000102','Economy Standard','ECONOMY', 110.00,  80.00, 17, ARRAY['23kg baggage','Snack']),
('70000000-0000-0000-0000-000000000104','60000000-0000-0000-0000-000000000103','Economy Standard','ECONOMY', 450.00, 320.00, 16, ARRAY['30kg baggage','Meal included','Entertainment']),
('70000000-0000-0000-0000-000000000105','60000000-0000-0000-0000-000000000103','Business Flex',   'BUSINESS',1800.00,1350.00, 11, ARRAY['40kg baggage','Lounge access','Lie-flat seat']);

-- Seat status for past flights (all available, then we mark booked ones as OCCUPIED below)
INSERT INTO flight_seat_status (flight_id, seat_id, status)
SELECT f.id, s.id, 'AVAILABLE'
FROM flights f
JOIN airplanes a ON f.airplane_id = a.id
JOIN seats s ON s.model_id = a.model_id
WHERE f.id IN (
  '60000000-0000-0000-0000-000000000101',
  '60000000-0000-0000-0000-000000000102',
  '60000000-0000-0000-0000-000000000103'
);

-- =============================================================================
-- RESERVATIONS & TICKETS  (past bookings for flight history)
-- =============================================================================

-- Reservation 1: johndoe booked 2 economy seats on Cairo→Dubai (15 days ago)
INSERT INTO flight_reservations (id, user_id, fare_option_id, num_seats, total_price, status) VALUES
('80000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000002',
 '70000000-0000-0000-0000-000000000101',
 2, 560.00, 'CONFIRMED');

INSERT INTO tickets (id, reservation_id, seat_id, passenger_type, price, passport_number, passenger_name, date_of_birth) VALUES
('90000000-0000-0000-0000-000000000001',
 '80000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000013',  -- seat 3A
 'ADULT', 280.00, 'A12345678', 'John Doe', '1990-05-15'),
('90000000-0000-0000-0000-000000000002',
 '80000000-0000-0000-0000-000000000001',
 '50000000-0000-0000-0000-000000000014',  -- seat 3B
 'CHILD', 200.00, NULL, 'Emily Doe', '2015-08-20');

-- Mark those seats as OCCUPIED
UPDATE flight_seat_status SET status = 'OCCUPIED'
WHERE flight_id = '60000000-0000-0000-0000-000000000101'
  AND seat_id IN ('50000000-0000-0000-0000-000000000013','50000000-0000-0000-0000-000000000014');

-- Reservation 2: janesmith booked 1 business seat on London→Paris (30 days ago)
INSERT INTO flight_reservations (id, user_id, fare_option_id, num_seats, total_price, status) VALUES
('80000000-0000-0000-0000-000000000002',
 '10000000-0000-0000-0000-000000000003',
 '70000000-0000-0000-0000-000000000103',
 1, 110.00, 'CONFIRMED');

INSERT INTO tickets (id, reservation_id, seat_id, passenger_type, price, passport_number, passenger_name, date_of_birth) VALUES
('90000000-0000-0000-0000-000000000003',
 '80000000-0000-0000-0000-000000000002',
 '50000000-0000-0000-0000-000000000019',  -- seat 4A
 'ADULT', 110.00, 'B98765432', 'Jane Smith', '1988-11-03');

UPDATE flight_seat_status SET status = 'OCCUPIED'
WHERE flight_id = '60000000-0000-0000-0000-000000000102'
  AND seat_id = '50000000-0000-0000-0000-000000000019';

-- Reservation 3: ahmedhassan booked 1 business seat on Dubai→London (45 days ago)
INSERT INTO flight_reservations (id, user_id, fare_option_id, num_seats, total_price, status) VALUES
('80000000-0000-0000-0000-000000000003',
 '10000000-0000-0000-0000-000000000004',
 '70000000-0000-0000-0000-000000000105',
 1, 1800.00, 'CONFIRMED');

INSERT INTO tickets (id, reservation_id, seat_id, passenger_type, price, passport_number, passenger_name, date_of_birth) VALUES
('90000000-0000-0000-0000-000000000004',
 '80000000-0000-0000-0000-000000000003',
 '50000000-0000-0000-0000-000000000031',  -- seat 1A (777 model)
 'ADULT', 1800.00, 'C11223344', 'Ahmed Hassan', '1995-03-22');

UPDATE flight_seat_status SET status = 'OCCUPIED'
WHERE flight_id = '60000000-0000-0000-0000-000000000103'
  AND seat_id = '50000000-0000-0000-0000-000000000031';

-- Reservation 4: johndoe also booked 1 economy seat on Dubai→London (45 days ago)
INSERT INTO flight_reservations (id, user_id, fare_option_id, num_seats, total_price, status) VALUES
('80000000-0000-0000-0000-000000000004',
 '10000000-0000-0000-0000-000000000002',
 '70000000-0000-0000-0000-000000000104',
 1, 450.00, 'CONFIRMED');

INSERT INTO tickets (id, reservation_id, seat_id, passenger_type, price, passport_number, passenger_name, date_of_birth) VALUES
('90000000-0000-0000-0000-000000000005',
 '80000000-0000-0000-0000-000000000004',
 '50000000-0000-0000-0000-000000000043',  -- seat 3A (777 model)
 'ADULT', 450.00, 'A12345678', 'John Doe', '1990-05-15');

UPDATE flight_seat_status SET status = 'OCCUPIED'
WHERE flight_id = '60000000-0000-0000-0000-000000000103'
  AND seat_id = '50000000-0000-0000-0000-000000000043';

-- Reservation 5: janesmith cancelled reservation on Cairo→Dubai (15 days ago)
INSERT INTO flight_reservations (id, user_id, fare_option_id, num_seats, total_price, status) VALUES
('80000000-0000-0000-0000-000000000005',
 '10000000-0000-0000-0000-000000000003',
 '70000000-0000-0000-0000-000000000102',
 1, 950.00, 'CANCELLED');

INSERT INTO tickets (id, reservation_id, seat_id, passenger_type, price, passport_number, passenger_name, date_of_birth) VALUES
('90000000-0000-0000-0000-000000000006',
 '80000000-0000-0000-0000-000000000005',
 '50000000-0000-0000-0000-000000000001',  -- seat 1A (A320 model, business)
 'ADULT', 950.00, 'B98765432', 'Jane Smith', '1988-11-03');
-- seat stays AVAILABLE since reservation was cancelled
