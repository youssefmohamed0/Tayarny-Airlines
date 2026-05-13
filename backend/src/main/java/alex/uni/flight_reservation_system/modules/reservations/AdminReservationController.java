package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import alex.uni.flight_reservation_system.modules.reservations.dto.AdminReservationResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import alex.uni.flight_reservation_system.modules.tickets.TicketService;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationController {

    @Autowired
    private FlightReservationService reservationService;

    @Autowired
    private TicketService ticketService;

    @GetMapping
    public ResponseEntity<?> getAllReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fareOption.flight.departureTime"));
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

    @GetMapping("/{id}/tickets")
    public ResponseEntity<?> getReservationTickets(@PathVariable UUID id) {
        try {
            List<TicketResponse> tickets = ticketService.getTicketsByReservationId(id);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
