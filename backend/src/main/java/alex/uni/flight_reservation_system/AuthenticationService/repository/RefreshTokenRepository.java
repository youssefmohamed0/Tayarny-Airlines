package alex.uni.flight_reservation_system.AuthenticationService.repository;

import org.springframework.stereotype.Repository;
import alex.uni.flight_reservation_system.AuthenticationService.entity.RefreshToken;
import java.util.Optional;
import alex.uni.flight_reservation_system.AuthenticationService.entity.User;

@Repository
public class RefreshTokenRepository {

    public Optional<RefreshToken> findByToken(String token) {
        throw new UnsupportedOperationException("Unimplemented method 'findByToken'");
    }

    public RefreshToken save(RefreshToken refreshToken) {
        throw new UnsupportedOperationException("Unimplemented method 'save'");
    }

    public int deleteByUser(User user) {
        throw new UnsupportedOperationException("Unimplemented method 'deleteByUser'");
    }
}
