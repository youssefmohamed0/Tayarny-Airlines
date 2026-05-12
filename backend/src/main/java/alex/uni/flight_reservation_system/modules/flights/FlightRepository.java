package alex.uni.flight_reservation_system.modules.flights;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import alex.uni.flight_reservation_system.common.enums.FlightStatus;

@Repository
public interface FlightRepository extends JpaRepository<Flight, UUID> {

    @Query("SELECT f FROM Flight f " +
           "JOIN FETCH f.originAirport " +
           "JOIN FETCH f.destinationAirport " +
           "JOIN FETCH f.airplane a " +
           "JOIN FETCH a.model " +
           "WHERE f.flightNumber = :flightNumber")
    Optional<Flight> findByFlightNumber(@Param("flightNumber") String flightNumber);

    @Query("SELECT f FROM Flight f " +
           "JOIN FETCH f.originAirport " +
           "JOIN FETCH f.destinationAirport " +
           "JOIN FETCH f.airplane a " +
           "JOIN FETCH a.model " +
           "WHERE f.id = :id")
    Optional<Flight> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT f FROM Flight f " +
           "JOIN FETCH f.originAirport " +
           "JOIN FETCH f.destinationAirport " +
           "JOIN FETCH f.airplane a " +
           "JOIN FETCH a.model")
    List<Flight> findAllWithDetails();

    // Derived Query: Finds flights that are in a specific status before a certain time
    List<Flight> findByStatusAndArrivalTimeBefore(FlightStatus status, LocalDateTime time);

    // Derived Query: Finds flights between specific airports departing after a certain time
    List<Flight> findByOriginAirportIdAndDestinationAirportIdAndDepartureTimeAfter(
            UUID originId, UUID destinationId, LocalDateTime currentTime);

    // Alternatively, for complex queries, you can write your own exact SQL (JPQL)
    // This is great for your search API to ensure the flight has enough available seats!
    @Query("SELECT DISTINCT f FROM Flight f " +
           "JOIN FETCH f.originAirport " +
           "JOIN FETCH f.destinationAirport " +
           "JOIN FETCH f.airplane a " +
           "JOIN FETCH a.model " +
           "JOIN FareOption fo ON fo.flight = f " +
           "WHERE f.originAirport.id = :originId " +
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
