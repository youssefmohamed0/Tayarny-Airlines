package alex.uni.flight_reservation_system.modules.auth;

import alex.uni.flight_reservation_system.common.enums.Role;
import alex.uni.flight_reservation_system.modules.auth.dto.AuthenticationResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.LoginRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.SignupRequest;
import alex.uni.flight_reservation_system.modules.users.RefreshToken;
import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private org.springframework.security.core.userdetails.User testUserDetails;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.CUSTOMER);
        
        testUserDetails = new org.springframework.security.core.userdetails.User(
                "testuser", 
                "encodedPassword", 
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
    }

    @Test
    void testSignup_Success() {
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setPassword("rawPassword");
        request.setEmail("test@test.com");
        request.setFullName("Test User");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(userDetailsService.UsertToUserDetail(any(User.class))).thenReturn(testUserDetails);
        when(jwtService.generateToken(testUserDetails)).thenReturn("mockJwtToken");
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        
        RefreshToken mockRefreshToken = new RefreshToken();
        mockRefreshToken.setToken("mockRefreshToken");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(mockRefreshToken);

        AuthenticationResponse response = authenticationService.signup(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getAccessToken());
        assertEquals("mockRefreshToken", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("CUSTOMER", response.getRole());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void testSignup_UsernameExists() {
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authenticationService.signup(request));
        assertEquals("Username Already exists", ex.getMessage());
        
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("rawPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userDetailsService.UsertToUserDetail(testUser)).thenReturn(testUserDetails);
        when(jwtService.generateToken(testUserDetails)).thenReturn("mockJwtToken");
        
        RefreshToken mockRefreshToken = new RefreshToken();
        mockRefreshToken.setToken("mockRefreshToken");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(mockRefreshToken);

        AuthenticationResponse response = authenticationService.login(request);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getAccessToken());
        assertEquals("testuser", response.getUsername());
        
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
