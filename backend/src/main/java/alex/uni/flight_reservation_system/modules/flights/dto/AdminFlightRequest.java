package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Request DTO for admin Add Flight (POST) and Modify Flight (PUT).
 * Matches the exact JSON contract with nested departure, arrival, and fareOptions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminFlightRequest {

    private String flightNumber;
    private String aircraft; // e.g., "Boeing 777-300ER"

    private DepartureDto departure;
    private ArrivalDto arrival;

    private List<AdminFareOptionDto> fareOptions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartureDto {
        private String airport;   // IATA code, e.g., "CAI"
        private String terminal;  // e.g., "3"
        private LocalDateTime time;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArrivalDto {
        private String airport;   // IATA code, e.g., "LHR"
        private LocalDateTime time;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminFareOptionDto {
        private String fareName;       // e.g., "Economy Semi-Flex"
        private Double pricePerSeat;
        private List<String> benefits;
        private Integer availableSeats;
    }
}
