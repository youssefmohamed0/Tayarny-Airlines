package alex.uni.flight_reservation_system.modules.users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import alex.uni.flight_reservation_system.common.enums.ReservationStatus;
import alex.uni.flight_reservation_system.modules.users.dto.UserResponse;
import alex.uni.flight_reservation_system.modules.users.exception.ResourceNotFoundException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
                    .role(user.getRole())
                    .totalFlights(totalFlights)
                    .build();
        } catch (Exception e) {
            throw new ResourceNotFoundException("User not found: " + e.getMessage());
        }
    }
}
