package alex.uni.flight_reservation_system.AuthenticationService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private Integer id;
    String token;
    String refreshToken;
    String username;
    String role;
}
