package alex.uni.flight_reservation_system.modules.tickets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservationService;

import java.util.UUID;

@RestController
@RequestMapping("/api/user/tickets")
public class UserTicketController {

    @Autowired
    private FlightReservationService reservationService;

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTicket(@PathVariable UUID id) {
        try {
            TicketResponse ticket = reservationService.cancelTicket(id);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
