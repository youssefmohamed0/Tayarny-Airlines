-- Migration to synchronize flight_seat_status and update fare option counts
BEGIN;

-- 1. Ensure flight_seat_status contains all seats for each flight's airplane model
-- Some older flights only had a subset of seats (e.g. only 30 instead of 180/396)
INSERT INTO flight_seat_status (flight_id, seat_id, status)
SELECT f.id, s.id, 'AVAILABLE'
FROM flights f
JOIN airplanes a ON f.airplane_id = a.id
JOIN seats s ON a.model_id = s.model_id
WHERE NOT EXISTS (
    SELECT 1 FROM flight_seat_status fss 
    WHERE fss.flight_id = f.id AND fss.seat_id = s.id
)
ON CONFLICT DO NOTHING;

-- 2. Recalculate available_seats for all fare_options to match the new seat distribution
-- This is critical after expanding flight_seat_status and changing seat classes
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

-- 3. Reset available_seats to 0 for cabin classes that no longer exist for a flight's model
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
