package alex.uni.flight_reservation_system.modules.auth.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    // private UUID id;
    String accessToken;
    String refreshToken;
    String username;
    String role;
}
