package alex.uni.flight_reservation_system.modules.tickets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservationService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    public ResponseEntity<?> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TicketResponse> tickets = ticketService.getAllTickets(pageable);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@PathVariable UUID id) {
        try {
            TicketResponse ticket = ticketService.getTicketById(id);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Autowired
    private FlightReservationService reservationService;

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTicket(@PathVariable UUID id) {
        try {
            TicketResponse ticket = reservationService.adminCancelTicket(id);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
