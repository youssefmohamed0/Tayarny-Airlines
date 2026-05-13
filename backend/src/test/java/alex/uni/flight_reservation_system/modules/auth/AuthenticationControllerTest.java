package alex.uni.flight_reservation_system.modules.auth;

import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.AuthenticationResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.LoginRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.SignupRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.TokenRefreshRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.TokenRefreshResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthenticationControllerTest {

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthenticationController authenticationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSignup_Success() {
        SignupRequest request = new SignupRequest();
        AuthenticationResponse authResponse = AuthenticationResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .username("testuser")
                .role("CUSTOMER")
                .build();

        when(authenticationService.signup(any(SignupRequest.class))).thenReturn(authResponse);

        ResponseEntity<?> response = authenticationController.signup(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(authResponse, response.getBody());
    }

    @Test
    void testSignup_Failure() {
        SignupRequest request = new SignupRequest();
        when(authenticationService.signup(any(SignupRequest.class))).thenThrow(new RuntimeException("Username Already exists"));

        ResponseEntity<?> response = authenticationController.signup(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals(400, apiResponse.getStatusCode());
        assertEquals("Username Already exists", apiResponse.getMessage());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        AuthenticationResponse authResponse = AuthenticationResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .username("testuser")
                .role("CUSTOMER")
                .build();

        when(authenticationService.login(any(LoginRequest.class))).thenReturn(authResponse);

        ResponseEntity<?> response = authenticationController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(authResponse, response.getBody());
    }

    @Test
    void testLogin_Failure() {
        LoginRequest request = new LoginRequest();
        when(authenticationService.login(any(LoginRequest.class))).thenThrow(new RuntimeException("Bad credentials"));

        ResponseEntity<?> response = authenticationController.login(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals(400, apiResponse.getStatusCode());
        assertEquals("Bad credentials", apiResponse.getMessage());
    }

    @Test
    void testRefreshToken_Success() {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("old-refresh-token");
        
        TokenRefreshResponse tokenRefreshResponse = new TokenRefreshResponse("new-access-token", "old-refresh-token");
        when(refreshTokenService.refreshAccessToken("old-refresh-token")).thenReturn(tokenRefreshResponse);

        ResponseEntity<?> response = authenticationController.refreshtoken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(tokenRefreshResponse, response.getBody());
    }

    @Test
    void testRefreshToken_Failure() {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("invalid-refresh-token");
        
        when(refreshTokenService.refreshAccessToken("invalid-refresh-token")).thenThrow(new RuntimeException("Invalid token"));

        ResponseEntity<?> response = authenticationController.refreshtoken(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals("Invalid token", apiResponse.getMessage());
    }

    @Test
    void testLogout_Success() {
        TokenRefreshRequest request = new TokenRefreshRequest();
        request.setRefreshToken("valid-refresh-token");

        doNothing().when(refreshTokenService).logUserOut(any(TokenRefreshRequest.class));

        ResponseEntity<?> response = authenticationController.logoutUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Log out successful!", response.getBody());
    }
}
