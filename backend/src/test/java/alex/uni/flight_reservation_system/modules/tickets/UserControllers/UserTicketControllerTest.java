package alex.uni.flight_reservation_system.modules.tickets.UserControllers;

import alex.uni.flight_reservation_system.modules.reservations.FlightReservationService;
import alex.uni.flight_reservation_system.modules.tickets.UserTicketController;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class UserTicketControllerTest {

    @Mock
    private FlightReservationService reservationService;

    @InjectMocks
    private UserTicketController userTicketController;

    private final UUID testId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCancelTicket_Success() {
        TicketResponse mockResponse = TicketResponse.builder()
                .id(testId)
                .passengerName("John Doe")
                .status("CANCELLED")
                .build();
        when(reservationService.cancelTicket(testId)).thenReturn(mockResponse);

        ResponseEntity<?> response = userTicketController.cancelTicket(testId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testCancelTicket_Failure() {
        when(reservationService.cancelTicket(testId)).thenThrow(new RuntimeException("Ticket not found"));

        ResponseEntity<?> response = userTicketController.cancelTicket(testId);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Ticket not found", response.getBody());
    }
}
