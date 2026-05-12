package alex.uni.flight_reservation_system.modules.fare_options;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FareOptionRepository extends JpaRepository<FareOption, UUID> {

    // Used during checkout to get the exact price of a specific ticket
    Optional<FareOption> findByFlightIdAndCabinClass(UUID flightId, String cabinClass);

    List<FareOption> findByFlightId(UUID flightId);
}