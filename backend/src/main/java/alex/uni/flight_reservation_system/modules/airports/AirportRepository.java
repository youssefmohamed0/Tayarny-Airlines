package alex.uni.flight_reservation_system.modules.airports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AirportRepository extends JpaRepository<Airport, UUID> {

    // This allows your FlightService to quickly find the Airport UUID 
    // when the frontend sends "CAI" or "LHR"
    Optional<Airport> findByIataCode(String iataCode);
}
