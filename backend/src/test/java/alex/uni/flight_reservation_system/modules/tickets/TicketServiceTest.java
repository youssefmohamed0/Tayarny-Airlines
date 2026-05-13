package alex.uni.flight_reservation_system.modules.tickets;

import alex.uni.flight_reservation_system.common.enums.SeatClass;
import alex.uni.flight_reservation_system.common.enums.PassengerType;
import alex.uni.flight_reservation_system.common.enums.SeatPosition;
import alex.uni.flight_reservation_system.common.enums.ReservationStatus;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservation;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private TicketService ticketService;

    private Ticket testTicket;
    private final UUID testTicketId = UUID.randomUUID();
    private final UUID testReservationId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        FlightReservation testReservation = new FlightReservation();
        testReservation.setId(testReservationId);

        Seat testSeat = new Seat();
        testSeat.setSeatNum("12A");
        testSeat.setSeatClass(SeatClass.ECONOMY);
        testSeat.setPosition(SeatPosition.WINDOW);

        testTicket = new Ticket();
        testTicket.setId(testTicketId);
        testTicket.setReservation(testReservation);
        testTicket.setPassengerName("John Doe");
        testTicket.setPassengerType(PassengerType.ADULT);
        testTicket.setSeat(testSeat);
        testTicket.setPrice(150.0);
        testTicket.setPassportNumber("AB123456");
        testTicket.setDateOfBirth(LocalDate.of(1990, 1, 1));
        testTicket.setStatus(ReservationStatus.CONFIRMED);
    }

    @Test
    void testGetTicketsByReservationId() {
        when(ticketRepository.findByReservationId(testReservationId))
                .thenReturn(Collections.singletonList(testTicket));

        List<TicketResponse> results = ticketService.getTicketsByReservationId(testReservationId);

        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getPassengerName());
        assertEquals("12A", results.get(0).getSeatNumber());
        assertEquals("ECONOMY", results.get(0).getSeatClass());
        assertEquals("CONFIRMED", results.get(0).getStatus());
    }

    @Test
    void testGetAllTickets() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Ticket> ticketPage = new PageImpl<>(Collections.singletonList(testTicket), pageable, 1);
        when(ticketRepository.findAll(pageable)).thenReturn(ticketPage);

        Page<TicketResponse> results = ticketService.getAllTickets(pageable);

        assertNotNull(results);
        assertEquals(1, results.getTotalElements());
        assertEquals("John Doe", results.getContent().get(0).getPassengerName());
    }

    @Test
    void testGetTicketById_Success() {
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.of(testTicket));

        TicketResponse result = ticketService.getTicketById(testTicketId);

        assertNotNull(result);
        assertEquals(testTicketId, result.getId());
        assertEquals("John Doe", result.getPassengerName());
    }

    @Test
    void testGetTicketById_NotFound() {
        when(ticketRepository.findById(testTicketId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                ticketService.getTicketById(testTicketId));

        assertEquals("Ticket not found", exception.getMessage());
    }
}
