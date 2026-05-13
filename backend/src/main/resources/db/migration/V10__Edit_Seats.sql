-- Migration to update seat classes and fare options based on new model requirements
BEGIN;

-- 1. Update seats table for Airbus A320neo (30 rows total)
-- Rows 1-3: FIRST_CLASS, Rows 4-10: BUSINESS, Rows 11-30: ECONOMY
UPDATE seats SET class = 'FIRST_CLASS' 
WHERE model_id = '30000000-0000-0000-0000-000000000001' 
AND NULLIF(regexp_replace(seat_num, '\D', '', 'g'), '')::INT <= 3;

UPDATE seats SET class = 'BUSINESS' 
WHERE model_id = '30000000-0000-0000-0000-000000000001' 
AND NULLIF(regexp_replace(seat_num, '\D', '', 'g'), '')::INT BETWEEN 4 AND 10;

UPDATE seats SET class = 'ECONOMY' 
WHERE model_id = '30000000-0000-0000-0000-000000000001' 
AND NULLIF(regexp_replace(seat_num, '\D', '', 'g'), '')::INT >= 11;

-- 2. Update seats table for Boeing 777-300ER (66 rows total)
-- Rows 1-8: FIRST_CLASS, Rows 9-26: BUSINESS, Rows 27-66: ECONOMY
UPDATE seats SET class = 'FIRST_CLASS' 
WHERE model_id = '30000000-0000-0000-0000-000000000002' 
AND NULLIF(regexp_replace(seat_num, '\D', '', 'g'), '')::INT <= 8;

UPDATE seats SET class = 'BUSINESS' 
WHERE model_id = '30000000-0000-0000-0000-000000000002' 
AND NULLIF(regexp_replace(seat_num, '\D', '', 'g'), '')::INT BETWEEN 9 AND 26;

UPDATE seats SET class = 'ECONOMY' 
WHERE model_id = '30000000-0000-0000-0000-000000000002' 
AND NULLIF(regexp_replace(seat_num, '\D', '', 'g'), '')::INT >= 27;

-- 3. Add missing FIRST_CLASS fare options for flights that don't have them
-- We use a sensible price multiplier (Business * 1.5) and default benefits
INSERT INTO fare_options (id, flight_id, fare_name, cabin_class, price_per_adult, price_per_child, available_seats, benefits)
SELECT 
    gen_random_uuid(),
    f.id,
    'First Class' as fare_name,
    'FIRST_CLASS' as cabin_class,
    ROUND(fo.price_per_adult * 1.5, 2) as price_per_adult,
    ROUND(fo.price_per_child * 1.5, 2) as price_per_child,
    0 as available_seats, -- Will be updated in step 4
    '{"Private Suite", "Fine Dining", "Lounge Access", "Priority Boarding"}'::text[] as benefits
FROM flights f
JOIN fare_options fo ON f.id = fo.flight_id AND fo.cabin_class = 'BUSINESS'
WHERE NOT EXISTS (SELECT 1 FROM fare_options fo2 WHERE fo2.flight_id = f.id AND fo2.cabin_class = 'FIRST_CLASS');

-- 4. Recalculate available_seats for all fare_options to match new seat distribution
-- This ensures that available_seats = total seats in class - currently occupied seats
WITH seat_stats AS (
    SELECT 
        f.id as flight_id,
        s.class as seat_class,
        COUNT(s.id) as total_seats,
        COUNT(fss.seat_id) FILTER (WHERE fss.status = 'OCCUPIED') as occupied_seats
    FROM flights f
    JOIN airplanes a ON f.airplane_id = a.id
    JOIN seats s ON a.model_id = s.model_id
    LEFT JOIN flight_seat_status fss ON f.id = fss.flight_id AND s.id = fss.seat_id
    GROUP BY f.id, s.class
)
UPDATE fare_options fo
SET available_seats = GREATEST(0, ss.total_seats - ss.occupied_seats)
FROM seat_stats ss
WHERE fo.flight_id = ss.flight_id 
AND fo.cabin_class = ss.seat_class;

-- 5. Final check: if any fare_option cabin_class doesn't exist in the seats for that model, set available_seats to 0
UPDATE fare_options fo
SET available_seats = 0
WHERE NOT EXISTS (
    SELECT 1 
    FROM flights f
    JOIN airplanes a ON f.airplane_id = a.id
    JOIN seats s ON a.model_id = s.model_id
    WHERE f.id = fo.flight_id AND s.class = fo.cabin_class
);

COMMIT;
