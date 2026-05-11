package alex.uni.flight_reservation_system.modules.airplanes.dto;

import java.util.UUID;

public record CreateAirplaneRequest(
        UUID modelId,
        String condition,
        Integer numberOfFlights
) {
}
