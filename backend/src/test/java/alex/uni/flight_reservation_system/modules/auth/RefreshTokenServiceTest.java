package alex.uni.flight_reservation_system.modules.auth;

import alex.uni.flight_reservation_system.modules.auth.dto.TokenRefreshRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.TokenRefreshResponse;
import alex.uni.flight_reservation_system.modules.users.RefreshToken;
import alex.uni.flight_reservation_system.modules.users.RefreshTokenRepository;
import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;
    private RefreshToken validRefreshToken;
    private RefreshToken expiredRefreshToken;
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", 86400000L); // 24 hours

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");

        validRefreshToken = new RefreshToken();
        validRefreshToken.setToken("valid-token");
        validRefreshToken.setUser(testUser);
        validRefreshToken.setExpiryDate(Instant.now().plusMillis(86400000L));

        expiredRefreshToken = new RefreshToken();
        expiredRefreshToken.setToken("expired-token");
        expiredRefreshToken.setUser(testUser);
        expiredRefreshToken.setExpiryDate(Instant.now().minusMillis(10000L));
    }

    @Test
    void testCreateRefreshToken() {
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(refreshTokenRepository.deleteByUser(testUser)).thenReturn(1);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken token = refreshTokenService.createRefreshToken(testUser);

        assertNotNull(token);
        assertEquals(testUser, token.getUser());
        assertNotNull(token.getToken());
        assertTrue(token.getExpiryDate().isAfter(Instant.now()));
        assertFalse(token.getRevoked());

        verify(refreshTokenRepository).deleteByUser(testUser);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void testValidateRefreshToken_Valid() {
        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(validRefreshToken));
        assertTrue(refreshTokenService.validateRefreshToken("valid-token"));
    }

    @Test
    void testValidateRefreshToken_Expired() {
        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredRefreshToken));
        assertFalse(refreshTokenService.validateRefreshToken("expired-token"));
    }

    @Test
    void testRefreshAccessToken_Success() {
        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(validRefreshToken));
        
        UserDetails mockUserDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(mockUserDetails);
        when(jwtService.generateToken(mockUserDetails)).thenReturn("new-access-token");

        TokenRefreshResponse response = refreshTokenService.refreshAccessToken("valid-token");

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("valid-token", response.getRefreshToken());
    }

    @Test
    void testRefreshAccessToken_InvalidTokenThrowsException() {
        when(refreshTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            refreshTokenService.refreshAccessToken("invalid-token")
        );

        assertEquals("Invalid or expired refresh token", exception.getMessage());
    }

    @Test
    void testVerifyExpiration_ValidToken() {
        RefreshToken result = refreshTokenService.verifyExpiration(validRefreshToken);
        assertEquals(validRefreshToken, result);
        verify(refreshTokenRepository, never()).deleteByUser(any(User.class));
    }

    @Test
    void testVerifyExpiration_ExpiredTokenThrowsException() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            refreshTokenService.verifyExpiration(expiredRefreshToken)
        );

        assertEquals("Refresh token was expired. Please make a new signin request", exception.getMessage());
        verify(refreshTokenRepository).deleteByUser(testUser);
    }

    @Test
    void testLogUserOut_Success() {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("valid-token");

        when(refreshTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(validRefreshToken));

        refreshTokenService.logUserOut(request);

        verify(refreshTokenRepository).deleteByUser(testUser);
    }
}
