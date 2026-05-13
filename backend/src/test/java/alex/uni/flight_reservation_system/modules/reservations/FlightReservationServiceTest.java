package alex.uni.flight_reservation_system.modules.reservations;

import alex.uni.flight_reservation_system.common.enums.*;
import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionRepository;
import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightRepository;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatus;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatusRepository;
import alex.uni.flight_reservation_system.modules.reservations.dto.CheckoutRequest;
import alex.uni.flight_reservation_system.modules.reservations.dto.ReservationResponse;
import alex.uni.flight_reservation_system.modules.reservations.dto.TravelerInfo;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.seats.SeatRepository;
import alex.uni.flight_reservation_system.modules.tickets.TicketRepository;
import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FlightReservationServiceTest {

    @Mock
    private FlightReservationRepository reservationRepository;
    @Mock
    private FlightRepository flightRepository;
    @Mock
    private FareOptionRepository fareOptionRepository;
    @Mock
    private FlightSeatStatusRepository seatStatusRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private FlightReservationService reservationService;

    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    private User testUser;
    private Flight testFlight;
    private FareOption testFareOption;
    private Seat testSeat;
    private FlightSeatStatus testSeatStatus;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");

        AirplaneModel model = new AirplaneModel();
        model.setId(UUID.randomUUID());

        Airplane airplane = new Airplane();
        airplane.setModel(model);

        testFlight = new Flight();
        testFlight.setId(UUID.randomUUID());
        testFlight.setFlightNumber("EK123");
        testFlight.setAirplane(airplane);
        testFlight.setStatus(FlightStatus.SCHEDULED);
        testFlight.setDepartureTime(LocalDateTime.now().plusDays(2));
        // Need origin/destination for mapper
        alex.uni.flight_reservation_system.modules.airports.Airport origin = new alex.uni.flight_reservation_system.modules.airports.Airport();
        origin.setName("Cairo Intl");
        origin.setCity("Cairo");
        testFlight.setOriginAirport(origin);
        alex.uni.flight_reservation_system.modules.airports.Airport dest = new alex.uni.flight_reservation_system.modules.airports.Airport();
        dest.setName("Dubai Intl");
        dest.setCity("Dubai");
        testFlight.setDestinationAirport(dest);

        testFareOption = new FareOption();
        testFareOption.setId(UUID.randomUUID());
        testFareOption.setFlight(testFlight);
        testFareOption.setCabinClass("ECONOMY");
        testFareOption.setFareName("Economy");
        testFareOption.setPricePerAdult(100.0);
        testFareOption.setPricePerChild(50.0);
        testFareOption.setAvailableSeats(10);

        testSeat = new Seat();
        testSeat.setId(UUID.randomUUID());
        testSeat.setSeatNum("12A");
        testSeat.setSeatClass(SeatClass.ECONOMY);
        testSeat.setPosition(SeatPosition.WINDOW);

        testSeatStatus = new FlightSeatStatus();
        testSeatStatus.setFlight(testFlight);
        testSeatStatus.setSeat(testSeat);
        testSeatStatus.setStatus(FlightSeatStatusEnum.AVAILABLE);
    }

    @Test
    void testCheckout_Success() {
        CheckoutRequest request = new CheckoutRequest();
        request.setFlightNumber("EK123");
        request.setFareClass("ECONOMY");
        request.setCardExpiryDate(LocalDateTime.now().plusYears(1).format(DateTimeFormatter.ofPattern("MM/yyyy")));
        
        TravelerInfo traveler = new TravelerInfo();
        traveler.setFullName("John Doe");
        traveler.setType("ADULT");
        traveler.setAssignedSeat("12A");
        request.setTravelers(Collections.singletonList(traveler));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(flightRepository.findByFlightNumber("EK123")).thenReturn(Optional.of(testFlight));
        when(fareOptionRepository.findByFlightIdAndCabinClass(any(), any())).thenReturn(Optional.of(testFareOption));
        when(seatRepository.findByAirplaneModelIdAndSeatNumIn(any(), any())).thenReturn(Collections.singletonList(testSeat));
        when(seatStatusRepository.findByFlightIdAndSeatIdsForUpdate(any(), any())).thenReturn(Collections.singletonList(testSeatStatus));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReservationResponse response = reservationService.checkout(request);

        assertNotNull(response);
        assertEquals("CONFIRMED", response.getStatus());
        assertEquals(100.0, response.getTotalPrice());
        assertEquals(9, testFareOption.getAvailableSeats());
        assertEquals(FlightSeatStatusEnum.OCCUPIED, testSeatStatus.getStatus());
    }

    @Test
    void testCheckout_SeatOccupied() {
        CheckoutRequest request = new CheckoutRequest();
        request.setFlightNumber("EK123");
        request.setFareClass("ECONOMY");
        request.setCardExpiryDate("12/2030");
        TravelerInfo traveler = new TravelerInfo();
        traveler.setAssignedSeat("12A");
        traveler.setType("ADULT");
        request.setTravelers(Collections.singletonList(traveler));

        testSeatStatus.setStatus(FlightSeatStatusEnum.OCCUPIED);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(flightRepository.findByFlightNumber("EK123")).thenReturn(Optional.of(testFlight));
        when(fareOptionRepository.findByFlightIdAndCabinClass(any(), any())).thenReturn(Optional.of(testFareOption));
        when(seatRepository.findByAirplaneModelIdAndSeatNumIn(any(), any())).thenReturn(Collections.singletonList(testSeat));
        when(seatStatusRepository.findByFlightIdAndSeatIdsForUpdate(any(), any())).thenReturn(Collections.singletonList(testSeatStatus));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> reservationService.checkout(request));
        assertTrue(exception.getMessage().contains("not available"));
    }

    @Test
    void testCancelReservation_Success() {
        FlightReservation reservation = new FlightReservation();
        reservation.setId(UUID.randomUUID());
        reservation.setUser(testUser);
        reservation.setFareOption(testFareOption);
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setNumSeats(1);
        reservation.setTotalPrice(100.0);

        alex.uni.flight_reservation_system.modules.tickets.Ticket ticket = new alex.uni.flight_reservation_system.modules.tickets.Ticket();
        ticket.setSeat(testSeat);
        ticket.setStatus(ReservationStatus.CONFIRMED);
        ticket.setPassengerType(PassengerType.ADULT);
        ticket.setPrice(100.0);
        reservation.setTickets(new ArrayList<>(List.of(ticket)));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(reservationRepository.findById(any())).thenReturn(Optional.of(reservation));
        when(seatStatusRepository.findByFlightIdAndSeatIdsForUpdate(any(), any())).thenReturn(Collections.singletonList(testSeatStatus));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReservationResponse response = reservationService.cancelReservation(reservation.getId());

        assertEquals("CANCELLED", response.getStatus());
        assertEquals(FlightSeatStatusEnum.AVAILABLE, testSeatStatus.getStatus());
        assertEquals(11, testFareOption.getAvailableSeats());
    }
}
