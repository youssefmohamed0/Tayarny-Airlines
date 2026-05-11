package alex.uni.flight_reservation_system.modules.users.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor 
@NoArgsConstructor
public class AdminUsersResponse {

    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private Integer totalFlights;
}
