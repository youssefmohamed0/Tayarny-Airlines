package alex.uni.flight_reservation_system.modules.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import alex.uni.flight_reservation_system.modules.auth.dto.AuthenticationResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.LoginRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.SignupRequest;
import alex.uni.flight_reservation_system.common.enums.Role;
import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.users.UserRepository;
import alex.uni.flight_reservation_system.modules.users.RefreshToken;

@Service
public class AuthenticationService {

    @Autowired
    UserRepository userRepository;
    @Autowired
    UserDetailsServiceImpl userDetailsService;
    @Autowired
    JwtService jwtService;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    RefreshTokenService refreshTokenService;

    public AuthenticationResponse signup(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username Already exists"); // TODO: custom UserAlreadyExists exception
        }
        User newUser = User.builder()
                .username(signupRequest.getUsername())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .fullName(signupRequest.getFullName())
                .email(signupRequest.getEmail())
                .role(Role.valueOf(signupRequest.getRole()))
                .build();
        userRepository.save(newUser);

        // UserDetails newUserDetails =
        // userDetailsService.loadUserByUsername(newUser.getUsername()); // this is an
        // extra DB hit
        UserDetails newUserDetails = userDetailsService.UsertToUserDetail(newUser); // this saves us from an extra DB
                                                                                    // hit
        String jwt = jwtService.generateToken(newUserDetails);

        User savedUser = userRepository.findByUsername(newUserDetails.getUsername()).orElse(null);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        return AuthenticationResponse.builder()
                // .id(savedUser.getId())
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .username(newUserDetails.getUsername())
                .role(newUserDetails.getAuthorities().iterator().next().getAuthority().substring(5))
                .build();
    }

    public AuthenticationResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()));

        // UserDetails userDetails =
        // userDetailsService.loadUserByUsername(loginRequest.getUsername()); // this is
        // an extra DB hit
        User loadedUser = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        UserDetails userDetails = userDetailsService.UsertToUserDetail(loadedUser); // this saves us from an extra DB
                                                                                    // hit
        String jwt = jwtService.generateToken(userDetails);

        // User loadedUser =
        // userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(loadedUser);

        return AuthenticationResponse.builder()
                // .id(loadedUser.getId())
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .username(userDetails.getUsername())
                .role(userDetails.getAuthorities().iterator().next().getAuthority().substring(5))
                .build();
    }

}
