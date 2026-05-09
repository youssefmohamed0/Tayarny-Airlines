package alex.uni.flight_reservation_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "airplane_models")
@Data
public class AirplaneModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "model_name", nullable = false)
    private String modelName; // e.g., "Airbus A320neo"

    @Column(nullable = false)
    private Integer capacity;

    // Renamed from flight_hours_per_charge to fit standard aviation metrics
    @Column(name = "max_range_km", nullable = false)
    private Integer maxRangeKm; 
}