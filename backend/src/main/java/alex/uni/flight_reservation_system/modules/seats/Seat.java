package alex.uni.flight_reservation_system.modules.seats;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.common.enums.SeatClass;
import alex.uni.flight_reservation_system.common.enums.SeatPosition;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"model_id", "seat_num"})
})
@Data
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private AirplaneModel airplaneModel;

    @Column(name = "seat_num", nullable = false)
    private String seatNum; // e.g., "10A"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatPosition position;

    @Enumerated(EnumType.STRING)
    @Column(name = "class", nullable = false)
    private SeatClass seatClass;
}
