package alex.uni.flight_reservation_system.FlightReservationService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import alex.uni.flight_reservation_system.AuthenticationService.entity.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // THE MAGIC: Spring automatically writes -> SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
    
    // Spring writes -> SELECT count(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email); 
}