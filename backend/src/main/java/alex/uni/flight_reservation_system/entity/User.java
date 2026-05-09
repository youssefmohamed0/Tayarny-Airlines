package alex.uni.flight_reservation_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "users") // Maps to the "users" table
@Data // Lombok annotation to auto-generate getters/setters
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Auto-generates UUIDs
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // One User can have Many Reservations
    // 'mappedBy' tells JPA that the 'user' field in FlightReservation owns the relationship
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<FlightReservation> reservations;
}