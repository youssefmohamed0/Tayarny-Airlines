package alex.uni.flight_reservation_system.modules.flights.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class FlightSearchRequest {

    private UUID originAirportId;
    private UUID destinationAirportId;

    private LocalDate departureDate;

    private int travelersCount;
}