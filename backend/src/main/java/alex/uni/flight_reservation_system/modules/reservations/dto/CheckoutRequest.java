package alex.uni.flight_reservation_system.modules.reservations.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Flight number is required")
    private String flightNumber;

    @NotBlank(message = "Fare class is required")
    private String fareClass;

    @NotEmpty(message = "At least one traveler is required")
    @Valid
    private List<TravelerInfo> travelers;

    @NotBlank(message = "Credit card number is required")
    private String creditCardNumber;

    @NotBlank(message = "Card expiry date is required")
    private String cardExpiryDate; // format: "MM/yyyy"
}
