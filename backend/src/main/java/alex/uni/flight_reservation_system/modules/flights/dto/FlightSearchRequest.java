package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for user flight search parameters.
 * Used with @ModelAttribute to bind GET query parameters:
 *   GET /api/flights?origin=CAI&destination=LHR&departureDate=2026-10-30
 *       &returnDate=2026-11-25&travelers.adults=2&travelers.children=3&cabinClass=ECONOMY
 */
@Data
public class FlightSearchRequest {

    private String origin;          // IATA code, e.g., "CAI"
    private String destination;     // IATA code, e.g., "LHR"

    private LocalDate departureDate;
    private LocalDate returnDate;   // Accepted but not used yet (future: round-trip support)

    private TravelersDto travelers;

    private String cabinClass;      // e.g., "ECONOMY", "BUSINESS"

    @Data
    public static class TravelersDto {
        private int adults;
        private int children;
    }
}