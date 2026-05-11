package alex.uni.flight_reservation_system.modules.reservations;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.tickets.Ticket;
import alex.uni.flight_reservation_system.common.enums.ReservationStatus;

@Entity
@Table(name = "flight_reservations")
@Data
public class FlightReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Many Reservations belong to One User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // The foreign key column
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fare_option_id", nullable = false)
    private FareOption fareOption;

    @Column(name = "num_seats", nullable = false)
    private Integer numSeats;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    // This allows you to save the reservation and all tickets atomically
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL)
    private List<Ticket> tickets;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;
}
