ALTER TABLE tickets ADD COLUMN status VARCHAR(20);

UPDATE tickets
SET status = fr.status
FROM flight_reservations fr
WHERE tickets.reservation_id = fr.id;

ALTER TABLE tickets ALTER COLUMN status SET NOT NULL;
