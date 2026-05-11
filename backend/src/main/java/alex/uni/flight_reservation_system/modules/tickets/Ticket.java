package alex.uni.flight_reservation_system.modules.tickets;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDate;

import alex.uni.flight_reservation_system.modules.reservations.FlightReservation;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.common.enums.PassengerType;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_type", nullable = false)
    private PassengerType passengerType;

    @Column(name = "passport_number")
    private String passportNumber;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
}
