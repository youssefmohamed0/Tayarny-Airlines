CREATE OR REPLACE FUNCTION update_reservation_ticket_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' OR NEW.status = 'CANCELLED' THEN
        -- Update confirmed reservations to the new flight status
        UPDATE flight_reservations
        SET status = NEW.status
        WHERE id IN (
            SELECT fr.id
            FROM flight_reservations fr
            JOIN fare_options fo ON fr.fare_option_id = fo.id
            WHERE fo.flight_id = NEW.id AND fr.status = 'CONFIRMED'
        );

        -- Update confirmed tickets to the new flight status
        UPDATE tickets
        SET status = NEW.status
        WHERE reservation_id IN (
            SELECT fr.id
            FROM flight_reservations fr
            JOIN fare_options fo ON fr.fare_option_id = fo.id
            WHERE fo.flight_id = NEW.id
        ) AND status = 'CONFIRMED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_flight_status ON flights;

CREATE TRIGGER trigger_update_flight_status
AFTER UPDATE OF status ON flights
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_reservation_ticket_status();
