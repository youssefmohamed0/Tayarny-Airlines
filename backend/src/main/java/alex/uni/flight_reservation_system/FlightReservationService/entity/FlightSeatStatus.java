package alex.uni.flight_reservation_system.FlightReservationService.entity;

import jakarta.persistence.*;
import lombok.Data;
import alex.uni.flight_reservation_system.FlightReservationService.enums.FlightSeatStatusEnum;

@Entity
@Table(name = "flight_seat_status")
@IdClass(FlightSeatStatusId.class)
@Data
public class FlightSeatStatus {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlightSeatStatusEnum status;
}
