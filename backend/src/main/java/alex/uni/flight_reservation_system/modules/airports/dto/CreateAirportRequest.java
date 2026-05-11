package alex.uni.flight_reservation_system.modules.airports.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateAirportRequest(

        @NotBlank(message = "Airport name is required")
        String name,

        @NotBlank(message = "City is required")
        String city,

        @NotBlank(message = "Country is required")
        String country,

        @NotBlank(message = "IATA code is required")
        @Size(min = 3, max = 3, message = "IATA code must be exactly 3 characters")
        @Pattern(regexp = "[A-Z]{3}", message = "IATA code must be 3 uppercase letters")
        String iataCode
) {
}
