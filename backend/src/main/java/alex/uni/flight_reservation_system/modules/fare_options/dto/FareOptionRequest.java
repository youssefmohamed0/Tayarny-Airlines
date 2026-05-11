package alex.uni.flight_reservation_system.modules.fare_options.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class FareOptionRequest {

    private UUID flightId;

    // e.g., "Economy", "Business", "First Class"
    private String cabinClass;

    // Pro-Tip: ALWAYS use BigDecimal for money in Java.
    // If you use 'double', 0.1 + 0.2 will equal 0.30000000000000004 and mess up
    // your billing!
    private BigDecimal price;

    // From your custom SQL query: tracks how many tickets of this class can be sold
    private int availableSeats;
}