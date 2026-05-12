package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for admin GET Flight.
 * Same shape as AdminFlightRequest but includes the flightId at the top level.
 */
@Data
@Builder
public class AdminFlightResponse {

    private UUID flightId;
    private String flightNumber;
    private String aircraft; // e.g., "Boeing 777-300ER"

    private DepartureDto departure;
    private ArrivalDto arrival;

    private List<AdminFareOptionDto> fareOptions;

    @Data
    @Builder
    public static class DepartureDto {
        private String airport;   // IATA code
        private String terminal;
        private LocalDateTime time;
    }

    @Data
    @Builder
    public static class ArrivalDto {
        private String airport;   // IATA code
        private LocalDateTime time;
    }

    @Data
    @Builder
    public static class AdminFareOptionDto {
        private String fareName;
        private Double pricePerSeat;
        private List<String> benefits;
        private Integer availableSeats;
    }
}
