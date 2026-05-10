package alex.uni.flight_reservation_system.modules.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {


    Optional<RefreshToken> findByToken(String token);

    @Transactional
    @Modifying
    int deleteByUser(User user);

    Optional<User> findUserByToken(String token);

}
