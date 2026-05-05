package alex.uni.flight_reservation_system.AuthenticationService.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import alex.uni.flight_reservation_system.AuthenticationService.enums.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Integer id;
    private String username;
    @Enumerated(EnumType.STRING)
    private Role role;
}
