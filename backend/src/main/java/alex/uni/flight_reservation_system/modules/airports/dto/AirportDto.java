package alex.uni.flight_reservation_system.modules.airports.dto;

import alex.uni.flight_reservation_system.modules.airports.Airport;

import java.util.UUID;

public record AirportDto(
        UUID id,
        String name,
        String city,
        String country,
        String iataCode
) {
    public static AirportDto from(Airport airport) {
        return new AirportDto(
                airport.getId(),
                airport.getName(),
                airport.getCity(),
                airport.getCountry(),
                airport.getIataCode()
        );
    }
}
