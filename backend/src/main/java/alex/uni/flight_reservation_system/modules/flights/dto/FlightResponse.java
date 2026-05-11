package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FlightResponse {

    // The UUID needed for the user to proceed to checkout
    private UUID id;
    private String flightNumber;

    // Human-readable strings for the frontend UI
    private String airplaneModel; // e.g., "Boeing 737"
    private String originAirportName; // e.g., "Cairo International Airport"
    private String destinationAirportName; // e.g., "Dubai International Airport"

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    // Using String here keeps it simple for the frontend (e.g., "SCHEDULED",
    // "DELAYED")
    private String status;
}