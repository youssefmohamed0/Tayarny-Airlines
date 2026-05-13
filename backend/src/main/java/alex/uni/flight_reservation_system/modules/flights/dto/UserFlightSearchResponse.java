package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Builder;
import lombok.Data;

import alex.uni.flight_reservation_system.common.enums.FlightStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for the user-facing search flights API.
 * Wraps results in a "flights" array with nested fare options including
 * computed totalPrice and priceBreakdown based on traveler counts.
 */
@Data
@Builder
public class UserFlightSearchResponse {

    private List<FlightDto> flights;

    @Data
    @Builder
    public static class FlightDto {
        private String flightNumber;
        private UUID id;
        private FlightStatus status;
        private String aircraft;
        private DepartureDto departure;
        private ArrivalDto arrival;
        private List<UserFareOptionDto> fareOptions;
    }

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
    public static class UserFareOptionDto {
        private String fareName;
        private String cabinClass;
        private Double totalPrice;     // Computed: (adults * pricePerAdult) + (children * pricePerChild)
        private PriceBreakdownDto priceBreakdown;
        private List<String> benefits;
        private Integer availableSeats;
    }

    @Data
    @Builder
    public static class PriceBreakdownDto {
        private PassengerPriceDto adult;
        private PassengerPriceDto child;
    }

    @Data
    @Builder
    public static class PassengerPriceDto {
        private int count;
        private Double farePerPassenger;
    }
}
