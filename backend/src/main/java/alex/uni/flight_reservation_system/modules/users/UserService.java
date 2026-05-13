package alex.uni.flight_reservation_system.modules.users;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import alex.uni.flight_reservation_system.common.enums.ReservationStatus;
import alex.uni.flight_reservation_system.modules.users.dto.AdminUsersResponse;
import alex.uni.flight_reservation_system.modules.users.dto.UserResponse;
import alex.uni.flight_reservation_system.modules.users.dto.UserUpdateRequest;
import alex.uni.flight_reservation_system.modules.users.exception.ResourceNotFoundException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile() throws Exception {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Integer totalFlights = (int) user.getReservations().stream()
                    .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                    .count();
            return UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .totalFlights(totalFlights)
                    .build();
        } catch (Exception e) {
            throw new ResourceNotFoundException("User not found: " + e.getMessage());
        }
    }

    @Transactional
    public UserResponse updateProfile(UserUpdateRequest reqeust) throws Exception {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (reqeust.getFullName() != null) {
                user.setFullName(reqeust.getFullName().trim());
            }
            if (reqeust.getEmail() != null) {
                user.setEmail(reqeust.getEmail().trim());
            }
            if (reqeust.getPassword() != null && !reqeust.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(reqeust.getPassword()));
            }
            userRepository.save(user);
            Integer totalFlights = (int) user.getReservations().stream()
                    .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                    .count();
            return UserResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .totalFlights(totalFlights)
                    .build();
        } catch (Exception e) {
            throw new ResourceNotFoundException("User not found: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AdminUsersResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<AdminUsersResponse> adminUsersResponses = new ArrayList<>();
        for (User user : users) {
            adminUsersResponses.add(AdminUsersResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole().toString())
                    .totalFlights((int) user.getReservations().stream()
                            .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                            .count())
                    .build());
        }
        return adminUsersResponses;
    }

    public void deleteUser(UUID id) throws ResourceNotFoundException { // admin only
        try {
            userRepository.deleteById(id);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException("User not found: " + id);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting user: " + e.getMessage());
        }
    }

    public void deleteProfile() throws ResourceNotFoundException { // user only
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            userRepository.delete(user);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting profile: " + e.getMessage());
        }
    }
}
