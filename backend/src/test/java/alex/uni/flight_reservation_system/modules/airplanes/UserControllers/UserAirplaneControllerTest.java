package alex.uni.flight_reservation_system.modules.airplanes.UserControllers;

import alex.uni.flight_reservation_system.modules.airplanes.dto.AirplaneDto;
import alex.uni.flight_reservation_system.modules.airplanes.services.AirplaneService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class UserAirplaneControllerTest {

    @Mock
    private AirplaneService airplaneService;

    @InjectMocks
    private UserAirplaneController userAirplaneController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testList() {
        when(airplaneService.list(null, null)).thenReturn(new ArrayList<>());
        ResponseEntity<?> response = userAirplaneController.list(null, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testGet_Success() {
        UUID id = UUID.randomUUID();
        AirplaneDto dto = new AirplaneDto(id, UUID.randomUUID(), "Boeing 737", "GOOD", 100);
        when(airplaneService.get(id)).thenReturn(Optional.of(dto));

        ResponseEntity<?> response = userAirplaneController.get(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testGet_NotFound() {
        UUID id = UUID.randomUUID();
        when(airplaneService.get(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userAirplaneController.get(id);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
