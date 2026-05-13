package alex.uni.flight_reservation_system.modules.tickets.AdminControllers;

import alex.uni.flight_reservation_system.modules.reservations.FlightReservationService;
import alex.uni.flight_reservation_system.modules.tickets.AdminTicketController;
import alex.uni.flight_reservation_system.modules.tickets.TicketService;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AdminTicketControllerTest {

    @Mock
    private TicketService ticketService;

    @Mock
    private FlightReservationService reservationService;

    @InjectMocks
    private AdminTicketController adminTicketController;

    private final UUID testId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllTickets_Success() {
        Page<TicketResponse> page = new PageImpl<>(Collections.singletonList(TicketResponse.builder().id(testId).build()));
        when(ticketService.getAllTickets(any(PageRequest.class))).thenReturn(page);

        ResponseEntity<?> response = adminTicketController.getAllTickets(0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testGetAllTickets_Failure() {
        when(ticketService.getAllTickets(any(PageRequest.class))).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<?> response = adminTicketController.getAllTickets(0, 10);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Database error", response.getBody());
    }

    @Test
    void testGetTicket_Success() {
        TicketResponse mockResponse = TicketResponse.builder().id(testId).build();
        when(ticketService.getTicketById(testId)).thenReturn(mockResponse);

        ResponseEntity<?> response = adminTicketController.getTicket(testId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testGetTicket_Failure() {
        when(ticketService.getTicketById(testId)).thenThrow(new RuntimeException("Ticket not found"));

        ResponseEntity<?> response = adminTicketController.getTicket(testId);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Ticket not found", response.getBody());
    }

    @Test
    void testCancelTicket_Success() {
        TicketResponse mockResponse = TicketResponse.builder().id(testId).status("CANCELLED").build();
        when(reservationService.adminCancelTicket(testId)).thenReturn(mockResponse);

        ResponseEntity<?> response = adminTicketController.cancelTicket(testId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testCancelTicket_Failure() {
        when(reservationService.adminCancelTicket(testId)).thenThrow(new RuntimeException("Error canceling ticket"));

        ResponseEntity<?> response = adminTicketController.cancelTicket(testId);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error canceling ticket", response.getBody());
    }
}
