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
        String username = signupRequest.getUsername() != null ? signupRequest.getUsername().trim() : null;
        String email = signupRequest.getEmail() != null ? signupRequest.getEmail().trim() : null;
        String fullName = signupRequest.getFullName() != null ? signupRequest.getFullName().trim() : null;

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username Already exists"); // TODO: custom UserAlreadyExists exception
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email Already exists"); // TODO: custom EmailAlreadyExists exception
        }
        User newUser = User.builder()
                .username(username)
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .fullName(fullName)
                .email(email)
                .role(Role.CUSTOMER)
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
        String username = loginRequest.getUsername() != null ? loginRequest.getUsername().trim() : null;
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                username,
                loginRequest.getPassword()));

        // UserDetails userDetails =
        // userDetailsService.loadUserByUsername(username); // this is
        // an extra DB hit
        User loadedUser = userRepository.findByUsername(username).orElse(null);
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
