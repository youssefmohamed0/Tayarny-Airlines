package alex.uni.flight_reservation_system.modules.flights.UserControllers;

import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.controller.UserFlightController;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightSearchRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.UserFlightSearchResponse;
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
import static org.mockito.Mockito.when;

class UserFlightControllerTest {

    @Mock
    private FlightService flightService;

    @InjectMocks
    private UserFlightController userFlightController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSearchFlights() {
        UserFlightSearchResponse mockResponse = UserFlightSearchResponse.builder().flights(new ArrayList<>()).build();
        when(flightService.searchUserFlights(any(FlightSearchRequest.class))).thenReturn(mockResponse);

        ResponseEntity<UserFlightSearchResponse> response = userFlightController.searchFlights(new FlightSearchRequest());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testGetSeatMap() {
        UUID flightId = UUID.randomUUID();
        when(flightService.getSeatMapForFlight(flightId)).thenReturn(new ArrayList<>());

        ResponseEntity<?> response = userFlightController.getSeatMap(flightId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
