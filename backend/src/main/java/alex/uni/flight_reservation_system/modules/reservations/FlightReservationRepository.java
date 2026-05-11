package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlightReservationRepository extends JpaRepository<FlightReservation, UUID> {

    // Fetches all reservations (flight history) for a specific user ID
    List<FlightReservation> findByUserId(UUID userId);
    
    // Navigates fareOption → flight → departureTime to sort newest first
    List<FlightReservation> findByUserIdOrderByFareOptionFlightDepartureTimeDesc(UUID userId);
}
