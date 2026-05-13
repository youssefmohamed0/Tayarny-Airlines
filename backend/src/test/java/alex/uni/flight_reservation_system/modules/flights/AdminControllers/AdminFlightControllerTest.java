package alex.uni.flight_reservation_system.modules.flights.AdminControllers;

import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.controller.AdminFlightController;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

class AdminFlightControllerTest {

    @Mock
    private FlightService flightService;

    @InjectMocks
    private AdminFlightController adminFlightController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetFlights() {
        when(flightService.getAdminFlights("EK123")).thenReturn(new ArrayList<>());
        ResponseEntity<?> response = adminFlightController.getFlights("EK123");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testAddFlight() {
        AdminFlightResponse mockResponse = AdminFlightResponse.builder().build();
        when(flightService.addAdminFlight(any())).thenReturn(mockResponse);

        ResponseEntity<AdminFlightResponse> response = adminFlightController.addFlight(new AdminFlightRequest());

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testModifyFlight() {
        UUID flightId = UUID.randomUUID();
        AdminFlightResponse mockResponse = AdminFlightResponse.builder().build();
        when(flightService.modifyAdminFlight(eq(flightId), any())).thenReturn(mockResponse);

        ResponseEntity<AdminFlightResponse> response = adminFlightController.modifyFlight(flightId, new AdminFlightRequest());

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testDeleteFlight() {
        UUID flightId = UUID.randomUUID();
        doNothing().when(flightService).deleteFlight(flightId);

        ResponseEntity<Void> response = adminFlightController.deleteFlight(flightId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }
}
