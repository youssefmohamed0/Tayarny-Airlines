package alex.uni.flight_reservation_system.AuthenticationService.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RefreshToken {
    private Integer tokenId;
    private User user;
    private String token;
    private Instant expiryDate;
}
