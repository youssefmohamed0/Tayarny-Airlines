package alex.uni.flight_reservation_system.AuthenticationService.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import alex.uni.flight_reservation_system.AuthenticationService.dto.TokenRefreshRequest;
import alex.uni.flight_reservation_system.AuthenticationService.dto.TokenRefreshResponse;
import alex.uni.flight_reservation_system.AuthenticationService.entity.RefreshToken;
import alex.uni.flight_reservation_system.AuthenticationService.entity.User;
import alex.uni.flight_reservation_system.AuthenticationService.jwt.JwtService;
import alex.uni.flight_reservation_system.AuthenticationService.repository.RefreshTokenRepository;
import alex.uni.flight_reservation_system.AuthenticationService.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class RefreshTokenService {

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    public RefreshToken createRefreshToken(User user) {
        deleteByUserId(user.getId()); // delete just in case there are multiple refresh tokens for the same user
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

    public TokenRefreshResponse refreshAccessToken(String refreshToken) {
        if (!this.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        UUID userId = refreshTokenRepository.findUserByToken(refreshToken).get().getId();
        if (userId == null) {
            throw new RuntimeException("Refresh token not found");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String newAccessToken = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getUsername()));
        return new TokenRefreshResponse(newAccessToken, refreshToken);
    }

    public boolean validateRefreshToken(String token) {
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(token);
        if (refreshTokenOpt.isEmpty()) {
            return false;
        }
        RefreshToken refreshToken = refreshTokenOpt.get();
        return refreshToken.getExpiryDate().isAfter(Instant.now());
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.deleteByUser(token.getUser());
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public int deleteByUserId(UUID userId) {
        return refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());
    }

    @Transactional
    public void logUserOut(TokenRefreshRequest request) {
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(request.getRefreshToken());
        if (refreshTokenOpt.isEmpty()) {
            throw new RuntimeException("Refresh token not found");
        }
        refreshTokenRepository.deleteByUser(refreshTokenOpt.get().getUser());
    }
}
