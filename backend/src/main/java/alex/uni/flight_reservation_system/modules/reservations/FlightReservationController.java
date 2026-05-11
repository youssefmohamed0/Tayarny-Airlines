package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import alex.uni.flight_reservation_system.modules.reservations.dto.CheckoutRequest;
import alex.uni.flight_reservation_system.modules.reservations.dto.ReservationResponse;
import alex.uni.flight_reservation_system.modules.tickets.TicketService;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
public class FlightReservationController {

    @Autowired
    private FlightReservationService reservationService;
    @Autowired
    private TicketService ticketService;

    // -------------------------------------------------------------------------
    // POST /api/checkout — book a flight (any authenticated user)
    // -------------------------------------------------------------------------
    @PostMapping("/api/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request) {
        try {
            ReservationResponse response = reservationService.checkout(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // GET /api/user/reservations — my booking history
    // -------------------------------------------------------------------------
    @GetMapping("/api/user/reservations")
    public ResponseEntity<?> getMyReservations() {
        try {
            List<ReservationResponse> reservations = reservationService.getMyReservations();
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // GET /api/user/reservations/{id} — single reservation detail
    // -------------------------------------------------------------------------
    @GetMapping("/api/user/reservations/{id}")
    public ResponseEntity<?> getMyReservation(@PathVariable UUID id) {
        try {
            ReservationResponse reservation = reservationService.getMyReservation(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // PUT /api/user/reservations/{id}/cancel — cancel my reservation
    // -------------------------------------------------------------------------
    @PutMapping("/api/user/reservations/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable UUID id) {
        try {
            ReservationResponse reservation = reservationService.cancelReservation(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // GET /api/user/reservations/{id}/tickets — tickets for my reservation
    // -------------------------------------------------------------------------
    @GetMapping("/api/user/reservations/{id}/tickets")
    public ResponseEntity<?> getMyTickets(@PathVariable UUID id) {
        try {
            // Verify ownership first
            reservationService.getMyReservation(id);
            List<TicketResponse> tickets = ticketService.getTicketsByReservationId(id);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
