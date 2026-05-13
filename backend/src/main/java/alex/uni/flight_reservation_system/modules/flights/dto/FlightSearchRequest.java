package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for user flight search parameters.
 * Used with @RequestBody to bind JSON payloads.
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