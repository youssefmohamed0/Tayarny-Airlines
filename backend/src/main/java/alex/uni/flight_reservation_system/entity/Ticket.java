package alex.uni.flight_reservation_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Data
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private FlightReservation reservation;

    // Linking directly to the seat number as requested in your ERD
    @Column(name = "seat_num", nullable = false)
    private String seatNum;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_type", nullable = false)
    private PassengerType passengerType;

    @Column(name = "passport_number")
    private String passportNumber;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;
}