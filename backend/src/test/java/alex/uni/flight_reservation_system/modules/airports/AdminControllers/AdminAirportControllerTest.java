package alex.uni.flight_reservation_system.modules.airports.AdminControllers;

import alex.uni.flight_reservation_system.modules.airports.dto.AirportDto;
import alex.uni.flight_reservation_system.modules.airports.dto.CreateAirportRequest;
import alex.uni.flight_reservation_system.modules.airports.dto.UpdateAirportRequest;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AdminAirportControllerTest {

    @Mock
    private AirportService airportService;

    @InjectMocks
    private AdminAirportController adminAirportController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testList() {
        AirportDto airport = new AirportDto(UUID.randomUUID(), "Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.search("CAI")).thenReturn(List.of(airport));

        ResponseEntity<List<AirportDto>> response = adminAirportController.list("CAI");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Cairo", response.getBody().get(0).name());
    }

    @Test
    void testGet_Found() {
        UUID id = UUID.randomUUID();
        AirportDto airport = new AirportDto(id, "Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.get(id)).thenReturn(Optional.of(airport));

        ResponseEntity<?> response = adminAirportController.get(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(airport, response.getBody());
    }

    @Test
    void testGet_NotFound() {
        UUID id = UUID.randomUUID();
        when(airportService.get(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = adminAirportController.get(id);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airport not found", response.getBody());
    }

    @Test
    void testGetByIataCode_Found() {
        AirportDto airport = new AirportDto(UUID.randomUUID(), "Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.getByIataCode("CAI")).thenReturn(Optional.of(airport));

        ResponseEntity<?> response = adminAirportController.getByIataCode("CAI");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(airport, response.getBody());
    }

    @Test
    void testGetByIataCode_NotFound() {
        when(airportService.getByIataCode("XXX")).thenReturn(Optional.empty());

        ResponseEntity<?> response = adminAirportController.getByIataCode("XXX");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airport with IATA code 'XXX' not found", response.getBody());
    }

    @Test
    void testCreate_Success() {
        CreateAirportRequest request = new CreateAirportRequest("Cairo", "Cairo", "Egypt", "CAI");
        AirportDto airportDto = new AirportDto(UUID.randomUUID(), "Cairo", "Cairo", "Egypt", "CAI");
        
        when(airportService.create(any(CreateAirportRequest.class))).thenReturn(airportDto);

        ResponseEntity<?> response = adminAirportController.create(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(airportDto, response.getBody());
    }

    @Test
    void testCreate_Failure() {
        CreateAirportRequest request = new CreateAirportRequest("Cairo", "Cairo", "Egypt", "CAI");
        when(airportService.create(any(CreateAirportRequest.class)))
                .thenThrow(new IllegalArgumentException("Already exists"));

        ResponseEntity<?> response = adminAirportController.create(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Already exists", response.getBody());
    }

    @Test
    void testUpdate_Success() {
        UUID id = UUID.randomUUID();
        UpdateAirportRequest request = new UpdateAirportRequest("Cairo Int", null, null, null);
        AirportDto airportDto = new AirportDto(id, "Cairo Int", "Cairo", "Egypt", "CAI");

        when(airportService.update(eq(id), any(UpdateAirportRequest.class))).thenReturn(Optional.of(airportDto));

        ResponseEntity<?> response = adminAirportController.update(id, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(airportDto, response.getBody());
    }

    @Test
    void testUpdate_NotFound() {
        UUID id = UUID.randomUUID();
        UpdateAirportRequest request = new UpdateAirportRequest("Cairo Int", null, null, null);

        when(airportService.update(eq(id), any(UpdateAirportRequest.class))).thenReturn(Optional.empty());

        ResponseEntity<?> response = adminAirportController.update(id, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airport not found", response.getBody());
    }

    @Test
    void testUpdate_Failure() {
        UUID id = UUID.randomUUID();
        UpdateAirportRequest request = new UpdateAirportRequest(null, null, null, "DUPE");

        when(airportService.update(eq(id), any(UpdateAirportRequest.class)))
                .thenThrow(new IllegalArgumentException("Already exists"));

        ResponseEntity<?> response = adminAirportController.update(id, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Already exists", response.getBody());
    }

    @Test
    void testDelete_Success() {
        UUID id = UUID.randomUUID();
        when(airportService.delete(id)).thenReturn(true);

        ResponseEntity<?> response = adminAirportController.delete(id);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(airportService, times(1)).delete(id);
    }

    @Test
    void testDelete_NotFound() {
        UUID id = UUID.randomUUID();
        when(airportService.delete(id)).thenReturn(false);

        ResponseEntity<?> response = adminAirportController.delete(id);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airport not found", response.getBody());
        verify(airportService, times(1)).delete(id);
    }
}
