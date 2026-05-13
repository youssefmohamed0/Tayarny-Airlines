package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlightReservationRepository extends JpaRepository<FlightReservation, UUID> {

    @Override
    @EntityGraph(attributePaths = {"user", "fareOption", "fareOption.flight", "fareOption.flight.originAirport", "fareOption.flight.destinationAirport", "fareOption.flight.airplane.model"})
    Page<FlightReservation> findAll(Pageable pageable);

    // Fetches all reservations (flight history) for a specific user ID
    List<FlightReservation> findByUserId(UUID userId);
    
    // Navigates fareOption → flight → departureTime to sort newest first
    Page<FlightReservation> findByUserIdOrderByFareOptionFlightDepartureTimeDesc(UUID userId, Pageable pageable);

    // Fetches all reservations for a specific user username, newest first
    Page<FlightReservation> findByUserUsernameOrderByFareOptionFlightDepartureTimeDesc(String username, Pageable pageable);

    // Fetches all reservations for a specific flight
    List<FlightReservation> findByFareOptionFlightId(UUID flightId);
}
