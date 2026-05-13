package alex.uni.flight_reservation_system.modules.reservations.UserControllers;

import alex.uni.flight_reservation_system.modules.reservations.FlightReservationController;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservationService;
import alex.uni.flight_reservation_system.modules.reservations.dto.CheckoutRequest;
import alex.uni.flight_reservation_system.modules.reservations.dto.ReservationResponse;
import alex.uni.flight_reservation_system.modules.tickets.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class FlightReservationControllerTest {

    @Mock
    private FlightReservationService reservationService;
    @Mock
    private TicketService ticketService;

    @InjectMocks
    private FlightReservationController flightReservationController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCheckout_Success() {
        ReservationResponse mockResponse = ReservationResponse.builder().build();
        when(reservationService.checkout(any(CheckoutRequest.class))).thenReturn(mockResponse);

        ResponseEntity<?> response = flightReservationController.checkout(new CheckoutRequest());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testGetMyReservations() {
        when(reservationService.getMyReservations(any())).thenReturn(new PageImpl<>(new ArrayList<>()));

        ResponseEntity<?> response = flightReservationController.getMyReservations(0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testCancelReservation() {
        UUID resId = UUID.randomUUID();
        when(reservationService.cancelReservation(resId)).thenReturn(ReservationResponse.builder().build());

        ResponseEntity<?> response = flightReservationController.cancelReservation(resId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
