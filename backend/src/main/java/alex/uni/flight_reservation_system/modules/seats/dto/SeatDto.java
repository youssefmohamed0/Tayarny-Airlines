package alex.uni.flight_reservation_system.modules.seats.dto;

import alex.uni.flight_reservation_system.common.enums.SeatClass;
import alex.uni.flight_reservation_system.common.enums.SeatPosition;
import lombok.Data;
import java.util.UUID;

@Data
public class SeatDto {
    private UUID id;
    private UUID airplaneModelId;
    private String seatNum;
    private SeatPosition position;
    private SeatClass seatClass;
    private String status; // Added to show seat availability
}
