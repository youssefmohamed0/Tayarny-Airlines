package alex.uni.flight_reservation_system.modules.fare_options.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class FareOptionResponse {

    private UUID id; // The specific ID of this pricing tier
    private UUID flightId;

    private String cabinClass;
    private BigDecimal price;
    private int availableSeats;
}