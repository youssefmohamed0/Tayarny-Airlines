package alex.uni.flight_reservation_system.modules.auth;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Inject values normally provided by @Value
        ReflectionTestUtils.setField(jwtService, "jwtSecret",
                "ThisIsAVeryLongSecretKeyUsedForTestingPurposesOnlyAndItMustBeAtLeast256Bits");
        ReflectionTestUtils.setField(jwtService, "tokenExpirationMs", 3600000L); // 1 hour

        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_USER");
        userDetails = new User("testuser", "password", Collections.singletonList(authority));
    }

    @Test
    void testGenerateToken() {
        String token = jwtService.generateToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractUsername() {
        String token = jwtService.generateToken(userDetails);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void testExtractRole() {
        String token = jwtService.generateToken(userDetails);
        String role = jwtService.extractRole(token);
        assertEquals("ROLE_USER", role);
    }

    @Test
    void testIsTokenValid() {
        String token = jwtService.generateToken(userDetails);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void testIsTokenExpired() {
        String token = jwtService.generateToken(userDetails);
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void testInvalidTokenWithDifferentUser() {
        String token = jwtService.generateToken(userDetails);

        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_USER");
        UserDetails differentUser = new User("otheruser", "password", Collections.singletonList(authority));

        assertFalse(jwtService.isTokenValid(token, differentUser));
    }

    @Test
    void testExtractAllClaims() {
        String token = jwtService.generateToken(userDetails);
        Claims claims = jwtService.extractAllClaims(token);

        assertNotNull(claims);
        assertEquals("testuser", claims.getSubject());
        assertEquals("ROLE_USER", claims.get("role"));
    }
}
