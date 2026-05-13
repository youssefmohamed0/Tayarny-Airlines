package alex.uni.flight_reservation_system.modules.airplanes.services;

import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneModelRepository;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneRepository;
import alex.uni.flight_reservation_system.modules.airplanes.dto.AirplaneDto;
import alex.uni.flight_reservation_system.modules.airplanes.dto.CreateAirplaneRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AirplaneServiceTest {

    @Mock
    private AirplaneRepository airplaneRepository;

    @Mock
    private AirplaneModelRepository airplaneModelRepository;

    @InjectMocks
    private AirplaneService airplaneService;

    private AirplaneModel testModel;
    private Airplane testAirplane;
    private final UUID testModelId = UUID.randomUUID();
    private final UUID testAirplaneId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testModel = new AirplaneModel();
        testModel.setId(testModelId);
        testModel.setModelName("Boeing 737");

        testAirplane = new Airplane();
        testAirplane.setId(testAirplaneId);
        testAirplane.setModel(testModel);
        testAirplane.setCondition("GOOD");
        testAirplane.setNumberOfFlights(100);
    }

    @Test
    void testCreate_Success() {
        CreateAirplaneRequest request = new CreateAirplaneRequest(testModelId, "GOOD", 100);

        when(airplaneModelRepository.findById(testModelId)).thenReturn(Optional.of(testModel));
        when(airplaneRepository.save(any(Airplane.class))).thenReturn(testAirplane);

        AirplaneDto response = airplaneService.create(request);

        assertNotNull(response);
        assertEquals(testAirplaneId, response.id());
        assertEquals("GOOD", response.condition());
        assertEquals(100, response.numberOfFlights());
    }

    @Test
    void testCreate_ModelNotFound() {
        CreateAirplaneRequest request = new CreateAirplaneRequest(testModelId, "GOOD", 100);

        when(airplaneModelRepository.findById(testModelId)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> airplaneService.create(request));
        assertTrue(ex.getMessage().contains("AirplaneModel not found"));
    }

    @Test
    void testDelete_Success() {
        when(airplaneRepository.existsById(testAirplaneId)).thenReturn(true);
        doNothing().when(airplaneRepository).deleteById(testAirplaneId);

        boolean result = airplaneService.delete(testAirplaneId);

        assertTrue(result);
        verify(airplaneRepository).deleteById(testAirplaneId);
    }

    @Test
    void testDelete_NotFound() {
        when(airplaneRepository.existsById(testAirplaneId)).thenReturn(false);

        boolean result = airplaneService.delete(testAirplaneId);

        assertFalse(result);
        verify(airplaneRepository, never()).deleteById(any());
    }

    @Test
    void testGet_Found() {
        when(airplaneRepository.findById(testAirplaneId)).thenReturn(Optional.of(testAirplane));

        Optional<AirplaneDto> result = airplaneService.get(testAirplaneId);

        assertTrue(result.isPresent());
        assertEquals(testAirplaneId, result.get().id());
    }

    @Test
    void testGet_NotFound() {
        when(airplaneRepository.findById(testAirplaneId)).thenReturn(Optional.empty());

        Optional<AirplaneDto> result = airplaneService.get(testAirplaneId);

        assertFalse(result.isPresent());
    }

    @Test
    void testList_All() {
        when(airplaneRepository.findAll()).thenReturn(Collections.singletonList(testAirplane));

        List<AirplaneDto> result = airplaneService.list(null, null);

        assertEquals(1, result.size());
        assertEquals(testAirplaneId, result.get(0).id());
    }

    @Test
    void testList_ByModelIdAndCondition() {
        when(airplaneRepository.findByModelIdAndCondition(testModelId, "GOOD")).thenReturn(Collections.singletonList(testAirplane));

        List<AirplaneDto> result = airplaneService.list(testModelId, "GOOD");

        assertEquals(1, result.size());
    }
}
