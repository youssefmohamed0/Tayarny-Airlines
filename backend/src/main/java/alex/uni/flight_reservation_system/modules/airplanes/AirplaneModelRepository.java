package alex.uni.flight_reservation_system.modules.airplanes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AirplaneModelRepository extends JpaRepository<AirplaneModel, UUID> {
}
