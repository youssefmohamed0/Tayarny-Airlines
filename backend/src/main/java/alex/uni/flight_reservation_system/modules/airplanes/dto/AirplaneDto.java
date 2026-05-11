package alex.uni.flight_reservation_system.modules.airplanes.dto;

import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;

import java.util.UUID;

public record AirplaneDto(
        UUID id,
        UUID modelId,
        String modelName,
        String condition,
        Integer numberOfFlights
) {
    public static AirplaneDto from(Airplane airplane) {
        AirplaneModel model = airplane.getModel();
        return new AirplaneDto(
                airplane.getId(),
                model != null ? model.getId() : null,
                model != null ? model.getModelName() : null,
                airplane.getCondition(),
                airplane.getNumberOfFlights()
        );
    }
}
