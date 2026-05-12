package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateFlightRequest {

    // An optional flight identifier (e.g., "MS-808")
    private String flightNumber;

    // The Admin selects these from dropdowns on the frontend, so we only need their
    // IDs
    private UUID airplaneId;
    private UUID originAirportId;
    private UUID destinationAirportId;

    // Scheduling times
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
}