package alex.uni.flight_reservation_system.modules.flights;

import alex.uni.flight_reservation_system.common.enums.FlightSeatStatusEnum;
import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.seats.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FlightSeatStatusServiceTest {

    @Mock
    private FlightSeatStatusRepository flightSeatStatusRepository;
    @Mock
    private SeatRepository seatRepository;

    @InjectMocks
    private FlightSeatStatusService flightSeatStatusService;

    private Flight testFlight;
    private Seat testSeat;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        AirplaneModel model = new AirplaneModel();
        model.setId(UUID.randomUUID());

        Airplane airplane = new Airplane();
        airplane.setModel(model);

        testFlight = new Flight();
        testFlight.setId(UUID.randomUUID());
        testFlight.setAirplane(airplane);

        testSeat = new Seat();
        testSeat.setId(UUID.randomUUID());
        testSeat.setSeatNum("12A");
    }

    @Test
    void testInitializeSeatsForFlight() {
        when(seatRepository.findByAirplaneModelId(any())).thenReturn(Collections.singletonList(testSeat));

        flightSeatStatusService.initializeSeatsForFlight(testFlight);

        verify(flightSeatStatusRepository).saveAll(anyList());
    }

    @Test
    void testLockAndBookSeats_Success() {
        FlightSeatStatus status = new FlightSeatStatus();
        status.setSeat(testSeat);
        status.setStatus(FlightSeatStatusEnum.AVAILABLE);

        when(flightSeatStatusRepository.findByFlightIdAndSeatIdsForUpdate(any(), any()))
                .thenReturn(Collections.singletonList(status));

        flightSeatStatusService.lockAndBookSeats(testFlight.getId(), Collections.singletonList(testSeat.getId()));

        assertEquals(FlightSeatStatusEnum.OCCUPIED, status.getStatus());
        verify(flightSeatStatusRepository).saveAll(anyList());
    }

    @Test
    void testLockAndBookSeats_AlreadyOccupied() {
        FlightSeatStatus status = new FlightSeatStatus();
        status.setSeat(testSeat);
        status.setStatus(FlightSeatStatusEnum.OCCUPIED);

        when(flightSeatStatusRepository.findByFlightIdAndSeatIdsForUpdate(any(), any()))
                .thenReturn(Collections.singletonList(status));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                flightSeatStatusService.lockAndBookSeats(testFlight.getId(), Collections.singletonList(testSeat.getId())));

        assertTrue(exception.getMessage().contains("was just booked"));
    }
}
