package alex.uni.flight_reservation_system.modules.seats.services;

import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneModelRepository;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.seats.SeatRepository;
import alex.uni.flight_reservation_system.modules.seats.dto.SeatDto;
import alex.uni.flight_reservation_system.common.enums.SeatClass;
import alex.uni.flight_reservation_system.common.enums.SeatPosition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SeatServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private AirplaneModelRepository airplaneModelRepository;

    @InjectMocks
    private SeatService seatService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetSeatsByModel() {
        UUID modelId = UUID.randomUUID();
        AirplaneModel airplaneModel = new AirplaneModel();
        airplaneModel.setId(modelId);

        Seat seat = new Seat();
        seat.setId(UUID.randomUUID());
        seat.setAirplaneModel(airplaneModel);
        seat.setSeatNum("10A");
        seat.setPosition(SeatPosition.WINDOW);
        seat.setSeatClass(SeatClass.ECONOMY);

        when(seatRepository.findByAirplaneModelId(modelId)).thenReturn(List.of(seat));

        List<SeatDto> result = seatService.getSeatsByModel(modelId);

        assertEquals(1, result.size());
        assertEquals("10A", result.get(0).getSeatNum());
        assertEquals(SeatPosition.WINDOW, result.get(0).getPosition());
        assertEquals(SeatClass.ECONOMY, result.get(0).getSeatClass());
    }

    @Test
    void testGetSeatById_Found() {
        UUID seatId = UUID.randomUUID();
        AirplaneModel airplaneModel = new AirplaneModel();
        airplaneModel.setId(UUID.randomUUID());

        Seat seat = new Seat();
        seat.setId(seatId);
        seat.setAirplaneModel(airplaneModel);
        seat.setSeatNum("10B");
        seat.setPosition(SeatPosition.MIDDLE);
        seat.setSeatClass(SeatClass.ECONOMY);

        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));

        Optional<SeatDto> result = seatService.getSeatById(seatId);

        assertTrue(result.isPresent());
        assertEquals("10B", result.get().getSeatNum());
    }

    @Test
    void testGetSeatById_NotFound() {
        UUID seatId = UUID.randomUUID();
        when(seatRepository.findById(seatId)).thenReturn(Optional.empty());

        Optional<SeatDto> result = seatService.getSeatById(seatId);

        assertFalse(result.isPresent());
    }
}
