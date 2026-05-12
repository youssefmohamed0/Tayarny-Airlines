package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import alex.uni.flight_reservation_system.modules.reservations.dto.AdminReservationResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    @Autowired
    private FlightReservationService reservationService;

    @GetMapping
    public ResponseEntity<?> getAllReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminReservationResponse> reservations = reservationService.getAllReservations(pageable);
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

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable UUID id) {
        try {
            AdminReservationResponse reservation = reservationService.adminCancelReservation(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
