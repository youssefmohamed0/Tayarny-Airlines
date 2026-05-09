package alex.uni.flight_reservation_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "airplanes")
@Data
public class Airplane {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private AirplaneModel model;

    @Column(nullable = false)
    private String condition; // You can later change this to an Enum: EXCELLENT, GOOD, MAINTENANCE

    @Column(name = "number_of_flights", nullable = false)
    private Integer numberOfFlights;
}