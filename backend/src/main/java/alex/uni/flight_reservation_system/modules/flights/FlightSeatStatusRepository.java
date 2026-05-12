package alex.uni.flight_reservation_system.modules.flights;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlightSeatStatusRepository extends JpaRepository<FlightSeatStatus, FlightSeatStatusId> {
    // USER QUERIES

    /**
     * Gets the entire seat map for a specific flight.
     * Used by the frontend to draw the airplane and show which seats are available.
     */
    List<FlightSeatStatus> findByFlightId(UUID flightId);

    /**
     * Finds one specific seat on a specific flight.
     * Useful for single-seat lookups or quick status checks.
     */
    Optional<FlightSeatStatus> findByFlightIdAndSeatId(UUID flightId, UUID seatId);

    // TRANSACTIONAL LOCKING QUERIES

    /**
     * Acquires a pessimistic (FOR UPDATE) lock on the requested seat rows.
     * This prevents concurrent bookings from selecting the same seats.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT fss FROM FlightSeatStatus fss WHERE fss.flight.id = :flightId AND fss.seat.id IN :seatIds")
    List<FlightSeatStatus> findByFlightIdAndSeatIdsForUpdate(
            @Param("flightId") UUID flightId,
            @Param("seatIds") List<UUID> seatIds);

    List<FlightSeatStatus> findByFlight_Id(UUID flightId); // why use this not findByFlightId?
}
