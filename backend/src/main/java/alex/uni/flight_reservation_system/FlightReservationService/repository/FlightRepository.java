package alex.uni.flight_reservation_system.FlightReservationService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import alex.uni.flight_reservation_system.FlightReservationService.entity.Flight;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FlightRepository extends JpaRepository<Flight, UUID> {

    // Derived Query: Finds flights between specific airports departing after a certain time
    List<Flight> findByOriginAirportIdAndDestinationAirportIdAndDepartureTimeAfter(
            UUID originId, UUID destinationId, LocalDateTime currentTime);

    // Alternatively, for complex queries, you can write your own exact SQL (JPQL)
    // This is great for your search API to ensure the flight has enough available seats!
    @Query("SELECT DISTINCT f FROM Flight f JOIN FareOption fo ON fo.flight = f WHERE f.originAirport.id = :originId " +
           "AND f.destinationAirport.id = :destId " +
           "AND f.departureTime BETWEEN :startOfDay AND :endOfDay " +
           "AND fo.availableSeats >= :travelersCount")
    List<Flight> searchAvailableFlights(
            @Param("originId") UUID originId,
            @Param("destId") UUID destinationId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("travelersCount") int travelersCount);
}