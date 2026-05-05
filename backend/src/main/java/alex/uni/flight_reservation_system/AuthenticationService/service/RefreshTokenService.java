package alex.uni.flight_reservation_system.AuthenticationService.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import alex.uni.flight_reservation_system.AuthenticationService.entity.RefreshToken;
import alex.uni.flight_reservation_system.AuthenticationService.entity.User;
import alex.uni.flight_reservation_system.AuthenticationService.repository.RefreshTokenRepository;
import alex.uni.flight_reservation_system.AuthenticationService.repository.UserRepository;

@Service
public class RefreshTokenService {

    @Value("${app.jwt.jwtRefreshExpirationMs}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public RefreshToken createRefreshToken(User user) {
        deleteByUserId(user.getUserId()); // delete just in case there are multiple refresh tokens for the same user
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.deleteByUser(token.getUser());
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public int deleteByUserId(Integer userId) {
        return refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());
    }
}
