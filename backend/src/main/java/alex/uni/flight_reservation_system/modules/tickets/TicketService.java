package alex.uni.flight_reservation_system.modules.tickets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByReservationId(UUID reservationId) {
        return ticketRepository.findByReservationId(reservationId).stream()
                .map(this::toTicketResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable)
                .map(this::toTicketResponse);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return toTicketResponse(ticket);
    }

    private TicketResponse toTicketResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .passengerName(t.getPassengerName())
                .passengerType(t.getPassengerType().name())
                .seatNumber(t.getSeat().getSeatNum())
                .seatClass(t.getSeat().getSeatClass().name())
                .seatPosition(t.getSeat().getPosition().name())
                .price(t.getPrice())
                .passportNumber(t.getPassportNumber())
                .dateOfBirth(t.getDateOfBirth())
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .build();
    }
}
