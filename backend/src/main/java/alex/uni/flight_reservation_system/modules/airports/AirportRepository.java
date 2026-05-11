package alex.uni.flight_reservation_system.modules.airports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AirportRepository extends JpaRepository<Airport, UUID> {

    // Lookup by IATA code — used by FlightService when the frontend sends "CAI" or "LHR"
    Optional<Airport> findByIataCode(String iataCode);

    // Duplicate-check on create
    boolean existsByIataCode(String iataCode);

    // Full-text style search across name, city, and country (case-insensitive)
    // Used by the frontend autocomplete — send any partial string and get matching airports
    @Query("""
            SELECT a FROM Airport a
            WHERE LOWER(a.name)    LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(a.city)    LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(a.country) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(a.iataCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY a.country, a.city, a.name
            """)
    List<Airport> searchByKeyword(@Param("keyword") String keyword);
}
