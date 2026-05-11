package alex.uni.flight_reservation_system.modules.seats.UserControllers;

import alex.uni.flight_reservation_system.modules.seats.dto.SeatDto;
import alex.uni.flight_reservation_system.modules.seats.services.SeatService;
import alex.uni.flight_reservation_system.common.enums.SeatClass;
import alex.uni.flight_reservation_system.common.enums.SeatPosition;
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

class UserSeatControllerTest {

    @Mock
    private SeatService seatService;

    @InjectMocks
    private UserSeatController userSeatController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetSeatsByModel() {
        UUID modelId = UUID.randomUUID();
        SeatDto seat = new SeatDto();
        seat.setId(UUID.randomUUID());
        seat.setAirplaneModelId(modelId);
        seat.setSeatNum("10A");
        seat.setPosition(SeatPosition.WINDOW);
        seat.setSeatClass(SeatClass.ECONOMY);

        when(seatService.getSeatsByModel(modelId)).thenReturn(List.of(seat));

        ResponseEntity<List<SeatDto>> response = userSeatController.getSeatsByModel(modelId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("10A", response.getBody().get(0).getSeatNum());
    }

    @Test
    void testGetSeatById_Found() {
        UUID seatId = UUID.randomUUID();
        SeatDto seat = new SeatDto();
        seat.setId(seatId);
        seat.setAirplaneModelId(UUID.randomUUID());
        seat.setSeatNum("10A");
        seat.setPosition(SeatPosition.WINDOW);
        seat.setSeatClass(SeatClass.ECONOMY);

        when(seatService.getSeatById(seatId)).thenReturn(Optional.of(seat));

        ResponseEntity<?> response = userSeatController.getSeatById(seatId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(seat, response.getBody());
    }

    @Test
    void testGetSeatById_NotFound() {
        UUID seatId = UUID.randomUUID();
        when(seatService.getSeatById(seatId)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userSeatController.getSeatById(seatId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Seat not found", response.getBody());
    }
}
