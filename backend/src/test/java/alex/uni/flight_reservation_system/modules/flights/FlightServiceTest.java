package alex.uni.flight_reservation_system.modules.flights;

import alex.uni.flight_reservation_system.common.enums.FlightStatus;
import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneModelRepository;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneRepository;
import alex.uni.flight_reservation_system.modules.airports.Airport;
import alex.uni.flight_reservation_system.modules.airports.AirportRepository;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionService;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightResponse;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightSearchRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.UserFlightSearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;
    @Mock
    private FlightSeatStatusService seatStatusService;
    @Mock
    private FareOptionService fareOptionService;
    @Mock
    private AirplaneRepository airplaneRepository;
    @Mock
    private AirplaneModelRepository airplaneModelRepository;
    @Mock
    private AirportRepository airportRepository;

    @InjectMocks
    private FlightService flightService;

    private Airport origin;
    private Airport destination;
    private Airplane airplane;
    private AirplaneModel airplaneModel;
    private Flight testFlight;
    private final UUID flightId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        origin = new Airport();
        origin.setId(UUID.randomUUID());
        origin.setIataCode("CAI");

        destination = new Airport();
        destination.setId(UUID.randomUUID());
        destination.setIataCode("DXB");

        airplaneModel = new AirplaneModel();
        airplaneModel.setId(UUID.randomUUID());
        airplaneModel.setModelName("Boeing 737");

        airplane = new Airplane();
        airplane.setId(UUID.randomUUID());
        airplane.setModel(airplaneModel);

        testFlight = new Flight();
        testFlight.setId(flightId);
        testFlight.setFlightNumber("EK123");
        testFlight.setOriginAirport(origin);
        testFlight.setDestinationAirport(destination);
        testFlight.setAirplane(airplane);
        testFlight.setDepartureTime(LocalDateTime.now().plusDays(1));
        testFlight.setArrivalTime(LocalDateTime.now().plusDays(1).plusHours(4));
        testFlight.setStatus(FlightStatus.SCHEDULED);
        testFlight.setTerminal("T3");
    }

    @Test
    void testSearchUserFlights_Success() {
        FlightSearchRequest request = new FlightSearchRequest();
        request.setOrigin("CAI");
        request.setDestination("DXB");
        request.setDepartureDate(LocalDate.now().plusDays(1));
        FlightSearchRequest.TravelersDto travelers = new FlightSearchRequest.TravelersDto();
        travelers.setAdults(1);
        travelers.setChildren(0);
        request.setTravelers(travelers);

        when(airportRepository.findByIataCode("CAI")).thenReturn(Optional.of(origin));
        when(airportRepository.findByIataCode("DXB")).thenReturn(Optional.of(destination));
        when(flightRepository.searchAvailableFlights(any(), any(), any(), any(), anyInt()))
                .thenReturn(Collections.singletonList(testFlight));

        FareOption fare = new FareOption();
        fare.setFareName("Economy");
        fare.setCabinClass("ECONOMY");
        fare.setPricePerAdult(100.0);
        fare.setPricePerChild(50.0);
        fare.setAvailableSeats(10);
        when(fareOptionService.getFareOptionsForFlight(flightId)).thenReturn(Collections.singletonList(fare));

        UserFlightSearchResponse response = flightService.searchUserFlights(request);

        assertNotNull(response);
        assertEquals(1, response.getFlights().size());
        assertEquals("EK123", response.getFlights().get(0).getFlightNumber());
        assertEquals(1, response.getFlights().get(0).getFareOptions().size());
        assertEquals(100.0, response.getFlights().get(0).getFareOptions().get(0).getTotalPrice());
    }

    @Test
    void testAddAdminFlight_Success() {
        AdminFlightRequest request = new AdminFlightRequest();
        request.setFlightNumber("EK123");
        request.setAircraft("Boeing 737");

        AdminFlightRequest.DepartureDto dep = new AdminFlightRequest.DepartureDto();
        dep.setAirport("CAI");
        dep.setTime(LocalDateTime.now().plusDays(1));
        dep.setTerminal("T1");
        request.setDeparture(dep);

        AdminFlightRequest.ArrivalDto arr = new AdminFlightRequest.ArrivalDto();
        arr.setAirport("DXB");
        arr.setTime(LocalDateTime.now().plusDays(1).plusHours(3));
        request.setArrival(arr);

        AdminFlightRequest.AdminFareOptionDto fareDto = new AdminFlightRequest.AdminFareOptionDto();
        fareDto.setFareName("Economy");
        fareDto.setPricePerSeat(100.0);
        fareDto.setAvailableSeats(50);
        request.setFareOptions(Collections.singletonList(fareDto));

        when(airportRepository.findByIataCode("CAI")).thenReturn(Optional.of(origin));
        when(airportRepository.findByIataCode("DXB")).thenReturn(Optional.of(destination));
        when(airplaneModelRepository.findByModelName("Boeing 737")).thenReturn(Optional.of(airplaneModel));
        when(airplaneRepository.findByModel(airplaneModel)).thenReturn(Collections.singletonList(airplane));
        when(flightRepository.save(any())).thenReturn(testFlight);
        when(flightRepository.findByIdWithDetails(any())).thenReturn(Optional.of(testFlight));

        AdminFlightResponse response = flightService.addAdminFlight(request);

        assertNotNull(response);
        assertEquals("EK123", response.getFlightNumber());
        verify(seatStatusService).initializeSeatsForFlight(any());
        verify(fareOptionService).addMultipleFareOptions(anyList());
    }

    @Test
    void testUpdateCompletedFlights() {
        when(flightRepository.updateStatusForArrivedFlights(eq(FlightStatus.SCHEDULED), eq(FlightStatus.COMPLETED),
                any()))
                .thenReturn(5);

        flightService.updateCompletedFlights();

        verify(flightRepository).updateStatusForArrivedFlights(eq(FlightStatus.SCHEDULED), eq(FlightStatus.COMPLETED),
                any());
    }
}
