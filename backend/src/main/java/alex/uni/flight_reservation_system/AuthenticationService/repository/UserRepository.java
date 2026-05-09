package alex.uni.flight_reservation_system.AuthenticationService.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import alex.uni.flight_reservation_system.AuthenticationService.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>  {

    public boolean existsByUsername(String username);
    public Optional<User> findByUsername(String username);

}
