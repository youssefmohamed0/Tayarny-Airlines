package alex.uni.flight_reservation_system.FlightReservationService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import alex.uni.flight_reservation_system.FlightReservationService.entity.FlightSeatStatus;
import alex.uni.flight_reservation_system.FlightReservationService.entity.FlightSeatStatusId;

@Repository
public interface FlightSeatStatusRepository extends JpaRepository<FlightSeatStatus, FlightSeatStatusId> {
}
