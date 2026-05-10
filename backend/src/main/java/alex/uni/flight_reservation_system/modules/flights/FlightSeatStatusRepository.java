package alex.uni.flight_reservation_system.modules.flights;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlightSeatStatusRepository extends JpaRepository<FlightSeatStatus, FlightSeatStatusId> {
}
