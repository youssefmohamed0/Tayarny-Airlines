package alex.uni.flight_reservation_system.modules.fare_options;

import alex.uni.flight_reservation_system.modules.flights.Flight;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FareOptionServiceTest {

    @Mock
    private FareOptionRepository fareOptionRepository;

    @InjectMocks
    private FareOptionService fareOptionService;

    private FareOption testFareOption;
    private final UUID testFareId = UUID.randomUUID();
    private final UUID testFlightId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        Flight testFlight = new Flight();
        testFlight.setId(testFlightId);

        testFareOption = new FareOption();
        testFareOption.setId(testFareId);
        testFareOption.setFlight(testFlight);
        testFareOption.setCabinClass("ECONOMY");
        testFareOption.setFareName("Economy Saver");
        testFareOption.setPricePerAdult(100.0);
        testFareOption.setPricePerChild(50.0);
        testFareOption.setAvailableSeats(50);
    }

    @Test
    void testGetFareByFlightAndClass_Success() {
        when(fareOptionRepository.findByFlightIdAndCabinClass(testFlightId, "ECONOMY"))
                .thenReturn(Optional.of(testFareOption));

        FareOption result = fareOptionService.getFareByFlightAndClass(testFlightId, "ECONOMY");

        assertNotNull(result);
        assertEquals(testFareId, result.getId());
        assertEquals("ECONOMY", result.getCabinClass());
    }

    @Test
    void testGetFareByFlightAndClass_NotFound() {
        when(fareOptionRepository.findByFlightIdAndCabinClass(testFlightId, "BUSINESS"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fareOptionService.getFareByFlightAndClass(testFlightId, "BUSINESS"));

        assertTrue(exception.getMessage().contains("Pricing not found"));
    }

    @Test
    void testGetFareOptionsForFlight() {
        when(fareOptionRepository.findByFlightId(testFlightId))
                .thenReturn(Collections.singletonList(testFareOption));

        List<FareOption> results = fareOptionService.getFareOptionsForFlight(testFlightId);

        assertEquals(1, results.size());
        assertEquals("ECONOMY", results.get(0).getCabinClass());
    }

    @Test
    void testGetFareById_Success() {
        when(fareOptionRepository.findById(testFareId)).thenReturn(Optional.of(testFareOption));

        FareOption result = fareOptionService.getFareById(testFareId);

        assertNotNull(result);
        assertEquals(testFareId, result.getId());
    }

    @Test
    void testGetFareById_NotFound() {
        when(fareOptionRepository.findById(testFareId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fareOptionService.getFareById(testFareId));

        assertTrue(exception.getMessage().contains("Fare option not found"));
    }

    @Test
    void testAddFareOption() {
        when(fareOptionRepository.save(any(FareOption.class))).thenReturn(testFareOption);

        FareOption result = fareOptionService.addFareOption(testFareOption);

        assertNotNull(result);
        verify(fareOptionRepository).save(testFareOption);
    }

    @Test
    void testAddMultipleFareOptions() {
        List<FareOption> options = Arrays.asList(testFareOption);
        when(fareOptionRepository.saveAll(options)).thenReturn(options);

        List<FareOption> results = fareOptionService.addMultipleFareOptions(options);

        assertEquals(1, results.size());
        verify(fareOptionRepository).saveAll(options);
    }

    @Test
    void testUpdateFareOption_Success() {
        when(fareOptionRepository.existsById(testFareId)).thenReturn(true);
        when(fareOptionRepository.save(testFareOption)).thenReturn(testFareOption);

        FareOption result = fareOptionService.updateFareOption(testFareOption);

        assertNotNull(result);
        verify(fareOptionRepository).save(testFareOption);
    }

    @Test
    void testUpdateFareOption_NotFound() {
        when(fareOptionRepository.existsById(testFareId)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                fareOptionService.updateFareOption(testFareOption));

        assertTrue(exception.getMessage().contains("Cannot update. Fare option not found."));
    }

    @Test
    void testDeleteFareOption() {
        doNothing().when(fareOptionRepository).deleteById(testFareId);

        fareOptionService.deleteFareOption(testFareId);

        verify(fareOptionRepository).deleteById(testFareId);
    }
}
