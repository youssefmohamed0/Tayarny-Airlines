package alex.uni.flight_reservation_system.modules.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.LoginRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.SignupRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.TokenRefreshRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.TokenRefreshResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    AuthenticationService authenticationService;
    @Autowired
    RefreshTokenService refreshTokenService;
    @Autowired
    JwtService jwtService;
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Transactional
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            return ResponseEntity.ok(authenticationService.signup(signupRequest));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, e.getMessage(), null));
        }
    }

    @Transactional
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            return ResponseEntity.ok(authenticationService.login(loginRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, e.getMessage(), null));
        }
    }

    @Transactional
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        try {
            TokenRefreshResponse response = refreshTokenService.refreshAccessToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, e.getMessage(), null));
        }
    }

    @Transactional
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@Valid @RequestBody TokenRefreshRequest request) {
        try {
            refreshTokenService.logUserOut(request);
            return ResponseEntity.ok("Log out successful!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, e.getMessage(), null));
        }
    }
}
