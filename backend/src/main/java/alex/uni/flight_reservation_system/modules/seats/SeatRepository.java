package alex.uni.flight_reservation_system.modules.seats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {

    // Grabs the physical layout template for a specific plane model
    List<Seat> findByAirplaneModelId(UUID modelId);
}
