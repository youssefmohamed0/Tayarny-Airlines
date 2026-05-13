package alex.uni.flight_reservation_system.modules.reservations.AdminControllers;

import alex.uni.flight_reservation_system.modules.reservations.AdminReservationController;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservationService;
import alex.uni.flight_reservation_system.modules.reservations.dto.AdminReservationResponse;
import alex.uni.flight_reservation_system.modules.tickets.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AdminReservationControllerTest {

    @Mock
    private FlightReservationService reservationService;

    @Mock
    private TicketService ticketService;

    @InjectMocks
    private AdminReservationController adminReservationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllReservations() {
        when(reservationService.getAllReservations(any())).thenReturn(new PageImpl<>(new ArrayList<>()));

        ResponseEntity<?> response = adminReservationController.getAllReservations(0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testGetReservation() {
        UUID resId = UUID.randomUUID();
        when(reservationService.getReservationAdmin(resId)).thenReturn(AdminReservationResponse.builder().build());

        ResponseEntity<?> response = adminReservationController.getReservation(resId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testCancelReservation() {
        UUID resId = UUID.randomUUID();
        when(reservationService.adminCancelReservation(resId)).thenReturn(AdminReservationResponse.builder().build());

        ResponseEntity<?> response = adminReservationController.cancelReservation(resId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testGetReservationTickets() {
        UUID resId = UUID.randomUUID();
        when(ticketService.getTicketsByReservationId(resId)).thenReturn(new ArrayList<>());

        ResponseEntity<?> response = adminReservationController.getReservationTickets(resId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
