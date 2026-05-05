package alex.uni.flight_reservation_system.AuthenticationService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import alex.uni.flight_reservation_system.AuthenticationService.dto.LoginRequest;
import alex.uni.flight_reservation_system.AuthenticationService.dto.SignupRequest;
import alex.uni.flight_reservation_system.AuthenticationService.service.AuthenticationService;
import alex.uni.flight_reservation_system.AuthenticationService.service.RefreshTokenService;
import alex.uni.flight_reservation_system.AuthenticationService.service.UserDetailsServiceImpl;
import alex.uni.flight_reservation_system.AuthenticationService.dto.TokenRefreshRequest;
import alex.uni.flight_reservation_system.AuthenticationService.dto.TokenRefreshResponse;
import alex.uni.flight_reservation_system.AuthenticationService.entity.RefreshToken;
import alex.uni.flight_reservation_system.AuthenticationService.jwt.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired AuthenticationService authenticationService;
    @Autowired RefreshTokenService refreshTokenService;
    @Autowired JwtService jwtService;
    @Autowired UserDetailsServiceImpl userDetailsService;

    @Transactional
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            return ResponseEntity.ok(authenticationService.signup(signupRequest));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @Transactional
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            return ResponseEntity.ok(authenticationService.login(loginRequest));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @Transactional
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
            .map(refreshTokenService::verifyExpiration)
            .map(RefreshToken::getUser)
            .map(user -> {
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
                String token = jwtService.generateToken(userDetails);
                return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
            })
            .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @Transactional
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@Valid @RequestBody TokenRefreshRequest request) {
        refreshTokenService.findByToken(request.getRefreshToken())
            .ifPresent(token -> refreshTokenService.deleteByUserId(token.getUser().getUserId()));
        return ResponseEntity.ok("Log out successful!");
    }
}
