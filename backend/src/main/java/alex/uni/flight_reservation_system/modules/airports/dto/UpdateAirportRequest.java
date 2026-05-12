package alex.uni.flight_reservation_system.modules.airports.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateAirportRequest(

        String name,

        String city,

        String country,

        @Size(min = 3, max = 3, message = "IATA code must be exactly 3 characters")
        @Pattern(regexp = "[A-Z]{3}", message = "IATA code must be 3 uppercase letters")
        String iataCode
) {
}
