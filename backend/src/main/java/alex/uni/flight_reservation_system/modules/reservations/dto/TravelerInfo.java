package alex.uni.flight_reservation_system.modules.reservations.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TravelerInfo {

    @NotBlank(message = "Traveler type is required (ADULT or CHILD)")
    private String type; // "ADULT" or "CHILD"

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String passportNumber; // optional for children

    private String dateOfBirth; // "yyyy-MM-dd", required for CHILD

    @NotBlank(message = "Assigned seat is required")
    private String assignedSeat; // e.g., "10A"
}
