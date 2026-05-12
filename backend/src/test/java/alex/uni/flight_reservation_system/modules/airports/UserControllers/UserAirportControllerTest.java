package alex.uni.flight_reservation_system.modules.airports.UserControllers;

import alex.uni.flight_reservation_system.modules.airports.dto.AirportDto;
import alex.uni.flight_reservation_system.modules.airports.services.AirportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class UserAirportControllerTest {

    @Mock
    private AirportService airportService;

    @InjectMocks
    private UserAirportController userAirportController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSearch() {
        AirportDto airport = new AirportDto(UUID.randomUUID(), "Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.search("CAI")).thenReturn(List.of(airport));

        ResponseEntity<List<AirportDto>> response = userAirportController.search("CAI");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Cairo", response.getBody().get(0).name());
    }

    @Test
    void testGet_Found() {
        UUID id = UUID.randomUUID();
        AirportDto airport = new AirportDto(id, "Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.get(id)).thenReturn(Optional.of(airport));

        ResponseEntity<?> response = userAirportController.get(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(airport, response.getBody());
    }

    @Test
    void testGet_NotFound() {
        UUID id = UUID.randomUUID();
        when(airportService.get(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userAirportController.get(id);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airport not found", response.getBody());
    }

    @Test
    void testGetByIataCode_Found() {
        AirportDto airport = new AirportDto(UUID.randomUUID(), "Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.getByIataCode("CAI")).thenReturn(Optional.of(airport));

        ResponseEntity<?> response = userAirportController.getByIataCode("CAI");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(airport, response.getBody());
    }

    @Test
    void testGetByIataCode_NotFound() {
        when(airportService.getByIataCode("XXX")).thenReturn(Optional.empty());

        ResponseEntity<?> response = userAirportController.getByIataCode("XXX");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airport with IATA code 'XXX' not found", response.getBody());
    }
}
