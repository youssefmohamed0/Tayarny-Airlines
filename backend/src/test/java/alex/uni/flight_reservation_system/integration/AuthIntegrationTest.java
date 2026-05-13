package alex.uni.flight_reservation_system.integration;

import alex.uni.flight_reservation_system.modules.auth.dto.AuthenticationResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.LoginRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.SignupRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AuthIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testAuthFlow_SignupLoginAndAccess() {
        // 1. Signup
        SignupRequest registerRequest = new SignupRequest();
        registerRequest.setUsername("integration_user");
        registerRequest.setPassword("password123");
        registerRequest.setEmail("integration@example.com");
        registerRequest.setFullName("Integration User");

        ResponseEntity<AuthenticationResponse> registerResponse = restTemplate.postForEntity(
                "/api/auth/signup", registerRequest, AuthenticationResponse.class);

        assertEquals(HttpStatus.OK, registerResponse.getStatusCode());
        assertNotNull(registerResponse.getBody().getAccessToken());

        // 2. Login
        LoginRequest loginRequest = new LoginRequest("integration_user", "password123");
        ResponseEntity<AuthenticationResponse> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", loginRequest, AuthenticationResponse.class);

        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        String token = loginResponse.getBody().getAccessToken();
        assertNotNull(token);

        // 3. Access Protected Resource (User Profile)
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> profileResponse = restTemplate.exchange(
                "/api/user", HttpMethod.GET, entity, String.class);

        assertEquals(HttpStatus.OK, profileResponse.getStatusCode());
    }

    @Test
    void testAccessDenied_NoToken() {
        ResponseEntity<Object> response = restTemplate.getForEntity("/api/user", Object.class);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
}
