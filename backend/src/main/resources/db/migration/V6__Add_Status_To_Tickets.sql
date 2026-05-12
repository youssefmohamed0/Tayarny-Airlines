ALTER TABLE tickets ADD COLUMN status VARCHAR(20);

UPDATE tickets t
JOIN flight_reservations fr ON t.reservation_id = fr.id
SET t.status = fr.status;

ALTER TABLE tickets MODIFY COLUMN status VARCHAR(20) NOT NULL;
