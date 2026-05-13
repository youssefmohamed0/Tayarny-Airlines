package alex.uni.flight_reservation_system.modules.seats.UserControllers;

import alex.uni.flight_reservation_system.modules.seats.dto.SeatDto;
import alex.uni.flight_reservation_system.modules.seats.services.SeatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * User-facing read-only endpoints for viewing seat layouts.
 */
@RestController
@RequestMapping("/api/user/seats")
public class UserSeatController {

    private final SeatService seatService;

    public UserSeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping("/model/{modelId}")
    public ResponseEntity<List<SeatDto>> getSeatsByModel(@PathVariable UUID modelId) {
        List<SeatDto> seats = seatService.getSeatsByModel(modelId);
        return ResponseEntity.ok(seats);
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<SeatDto>> getSeatsByFlight(@PathVariable UUID flightId) {
        List<SeatDto> seats = seatService.getSeatsByFlight(flightId);
        return ResponseEntity.ok(seats);
    }

}
