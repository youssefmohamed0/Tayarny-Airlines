-- V9__Distribute_Reservations.sql

-- 1. Insert 100 new mock users to spread reservations evenly
-- We use the exact same bcrypt hashed password as 'johndoe' ('password123')
INSERT INTO users (id, email, username, hashed_password, full_name, role)
SELECT 
    gen_random_uuid(), 
    'customer' || i || '@test.com', 
    'customer' || i, 
    '$2a$10$ValaPqDFCbsI/ptzF5lEH.iTGcpmF4GNUd4TAS0ikP77GENGvyEH2', 
    'Customer ' || i, 
    'CUSTOMER'
FROM generate_series(1, 100) as i;

-- 2. Redistribute all existing reservations across all customers
WITH numbered_reservations AS (
    SELECT id, ROW_NUMBER() OVER(ORDER BY id) as rn
    FROM flight_reservations
),
numbered_users AS (
    SELECT id, ROW_NUMBER() OVER(ORDER BY id) as rn, COUNT(*) OVER() as total_users
    FROM users
    WHERE role = 'CUSTOMER'
)
UPDATE flight_reservations fr
SET user_id = nu.id
FROM numbered_reservations nr
JOIN numbered_users nu ON (nr.rn % nu.total_users) + 1 = nu.rn
WHERE fr.id = nr.id;
