package alex.uni.flight_reservation_system.modules.airplanes.AdminControllers;

import alex.uni.flight_reservation_system.modules.airplanes.dto.AirplaneDto;
import alex.uni.flight_reservation_system.modules.airplanes.dto.CreateAirplaneRequest;
import alex.uni.flight_reservation_system.modules.airplanes.services.AirplaneService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

class AdminAirplaneControllerTest {

    @Mock
    private AirplaneService airplaneService;

    @InjectMocks
    private AdminAirplaneController adminAirplaneController;

    private final UUID testId = UUID.randomUUID();
    private AirplaneDto testAirplaneDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testAirplaneDto = new AirplaneDto(testId, UUID.randomUUID(), "Boeing 737", "GOOD", 100);
    }

    @Test
    void testList_Success() {
        when(airplaneService.list(null, null)).thenReturn(Collections.singletonList(testAirplaneDto));

        ResponseEntity<List<AirplaneDto>> response = adminAirplaneController.list(null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGet_Found() {
        when(airplaneService.get(testId)).thenReturn(Optional.of(testAirplaneDto));

        ResponseEntity<?> response = adminAirplaneController.get(testId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testAirplaneDto, response.getBody());
    }

    @Test
    void testGet_NotFound() {
        when(airplaneService.get(testId)).thenReturn(Optional.empty());

        ResponseEntity<?> response = adminAirplaneController.get(testId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airplane not found", response.getBody());
    }

    @Test
    void testCreate_Success() {
        CreateAirplaneRequest request = new CreateAirplaneRequest(UUID.randomUUID(), "GOOD", 100);
        when(airplaneService.create(request)).thenReturn(testAirplaneDto);

        ResponseEntity<?> response = adminAirplaneController.create(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testAirplaneDto, response.getBody());
    }

    @Test
    void testCreate_Failure() {
        CreateAirplaneRequest request = new CreateAirplaneRequest(UUID.randomUUID(), "GOOD", 100);
        when(airplaneService.create(request)).thenThrow(new IllegalArgumentException("Invalid Model"));

        ResponseEntity<?> response = adminAirplaneController.create(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid Model", response.getBody());
    }

    @Test
    void testDelete_Success() {
        when(airplaneService.delete(testId)).thenReturn(true);

        ResponseEntity<?> response = adminAirplaneController.delete(testId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void testDelete_NotFound() {
        when(airplaneService.delete(testId)).thenReturn(false);

        ResponseEntity<?> response = adminAirplaneController.delete(testId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Airplane not found", response.getBody());
    }
}
