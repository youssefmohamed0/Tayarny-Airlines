package alex.uni.flight_reservation_system.modules.fare_options.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class FareOptionResponse {

    private UUID id;
    private UUID flightId;

    private String fareName;
    private String cabinClass;
    private Double pricePerAdult;
    private Double pricePerChild;
    private int availableSeats;
}