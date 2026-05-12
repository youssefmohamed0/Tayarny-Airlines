package alex.uni.flight_reservation_system.modules.fare_options.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class FareOptionRequest {

    private UUID flightId;

    private String fareName;

    // e.g., "Economy", "Business", "First Class"
    private String cabinClass;

    private Double pricePerAdult;
    private Double pricePerChild;

    // Tracks how many tickets of this class can be sold
    private int availableSeats;
}