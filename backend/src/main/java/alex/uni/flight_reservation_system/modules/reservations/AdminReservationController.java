package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import alex.uni.flight_reservation_system.modules.reservations.dto.AdminReservationResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    @Autowired
    private FlightReservationService reservationService;

    @GetMapping
    public ResponseEntity<?> getAllReservations() {
        try {
            List<AdminReservationResponse> reservations = reservationService.getAllReservations();
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservation(@PathVariable UUID id) {
        try {
            AdminReservationResponse reservation = reservationService.getReservationAdmin(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
