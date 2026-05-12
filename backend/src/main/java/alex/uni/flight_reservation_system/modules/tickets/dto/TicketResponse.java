package alex.uni.flight_reservation_system.modules.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketResponse {

    private UUID id;
    private String passengerName;
    private String passengerType;
    private String seatNumber;
    private String seatClass;
    private String seatPosition;
    private double price;
    private String passportNumber;
    private LocalDate dateOfBirth;
    private String status;
}
