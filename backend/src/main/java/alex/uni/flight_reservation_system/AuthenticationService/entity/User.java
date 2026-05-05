package alex.uni.flight_reservation_system.AuthenticationService.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import alex.uni.flight_reservation_system.AuthenticationService.enums.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Integer userId;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private Role role;
}
