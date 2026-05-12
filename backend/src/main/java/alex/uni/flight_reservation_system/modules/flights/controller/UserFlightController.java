package alex.uni.flight_reservation_system.modules.flights.controller;

import alex.uni.flight_reservation_system.modules.airports.Airport;
import alex.uni.flight_reservation_system.modules.airports.AirportRepository;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionService;
import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatus;
import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatusService;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightSearchRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.UserFlightSearchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class UserFlightController {

    private final FlightService flightService;
    private final FlightSeatStatusService seatStatusService;
    private final FareOptionService fareOptionService;
    private final AirportRepository airportRepository;

    @Autowired
    public UserFlightController(FlightService flightService,
            FlightSeatStatusService seatStatusService,
            FareOptionService fareOptionService,
            AirportRepository airportRepository) {
        this.flightService = flightService;
        this.seatStatusService = seatStatusService;
        this.fareOptionService = fareOptionService;
        this.airportRepository = airportRepository;
    }

    // ==========================================
    // 1. SEARCH FLIGHTS
    // GET /api/flights?origin=CAI&destination=LHR&departureDate=2026-10-30
    //     &returnDate=2026-11-25&travelers.adults=2&travelers.children=3&cabinClass=ECONOMY
    //
    // Uses @ModelAttribute to bind flattened query parameters to a nested DTO.
    // This avoids the REST anti-pattern of sending a JSON body on a GET request.
    // ==========================================
    @GetMapping
    public ResponseEntity<UserFlightSearchResponse> searchFlights(
            @RequestBody FlightSearchRequest request) {

        // Resolve IATA codes to Airport entities
        Airport origin = airportRepository.findByIataCode(request.getOrigin())
                .orElseThrow(() -> new RuntimeException(
                        "Origin airport not found: " + request.getOrigin()));
        Airport destination = airportRepository.findByIataCode(request.getDestination())
                .orElseThrow(() -> new RuntimeException(
                        "Destination airport not found: " + request.getDestination()));

        // Calculate total travelers for the availability check
        int totalTravelers = request.getTravelers().getAdults()
                + request.getTravelers().getChildren();

        // Search for flights using existing service
        List<Flight> flights = flightService.searchFlights(
                origin.getId(),
                destination.getId(),
                request.getDepartureDate(),
                totalTravelers);

        // Map to response DTOs with computed pricing
        List<UserFlightSearchResponse.FlightDto> flightDtos = flights.stream()
                .map(flight -> mapToUserFlightDto(flight, request))
                .collect(Collectors.toList());

        return ResponseEntity.ok(UserFlightSearchResponse.builder()
                .flights(flightDtos)
                .build());
    }

    // ==========================================
    // 2. GET SEAT MAP
    // GET /api/flights/seats?flightId=...
    // ==========================================
    @GetMapping("/seats")
    public ResponseEntity<List<FlightSeatStatus>> getSeatMap(@RequestParam UUID flightId) {
        List<FlightSeatStatus> seatMap = seatStatusService.getSeatMapForFlight(flightId);
        return ResponseEntity.ok(seatMap);
    }

    // ==========================================
    // HELPERS
    // ==========================================

    /**
     * Maps a Flight entity to the user-facing FlightDto, including nested fare options
     * with computed prices based on traveler counts.
     */
    private UserFlightSearchResponse.FlightDto mapToUserFlightDto(
            Flight flight, FlightSearchRequest request) {

        int adults = request.getTravelers().getAdults();
        int children = request.getTravelers().getChildren();

        // Load fare options for this flight
        List<FareOption> fareOptions = fareOptionService.getFareOptionsForFlight(flight.getId());

        // Optionally filter by cabin class if provided
        if (request.getCabinClass() != null && !request.getCabinClass().isEmpty()) {
            fareOptions = fareOptions.stream()
                    .filter(f -> f.getCabinClass().equalsIgnoreCase(request.getCabinClass()))
                    .collect(Collectors.toList());
        }

        List<UserFlightSearchResponse.UserFareOptionDto> fareDtos = fareOptions.stream()
                .map(fare -> {
                    double adultTotal = adults * fare.getPricePerAdult();
                    double childTotal = children * fare.getPricePerChild();
                    double totalPrice = adultTotal + childTotal;

                    return UserFlightSearchResponse.UserFareOptionDto.builder()
                            .fareName(fare.getFareName())
                            .totalPrice(totalPrice)
                            .priceBreakdown(UserFlightSearchResponse.PriceBreakdownDto.builder()
                                    .adult(UserFlightSearchResponse.PassengerPriceDto.builder()
                                            .count(adults)
                                            .farePerPassenger(fare.getPricePerAdult())
                                            .build())
                                    .child(UserFlightSearchResponse.PassengerPriceDto.builder()
                                            .count(children)
                                            .farePerPassenger(fare.getPricePerChild())
                                            .build())
                                    .build())
                            .benefits(fare.getBenefits())
                            .availableSeats(fare.getAvailableSeats())
                            .build();
                })
                .collect(Collectors.toList());

        return UserFlightSearchResponse.FlightDto.builder()
                .flightNumber(flight.getFlightNumber())
                .aircraft(flight.getAirplane().getModel().getModelName())
                .departure(UserFlightSearchResponse.DepartureDto.builder()
                        .airport(flight.getOriginAirport().getIataCode())
                        .terminal(flight.getTerminal())
                        .time(flight.getDepartureTime())
                        .build())
                .arrival(UserFlightSearchResponse.ArrivalDto.builder()
                        .airport(flight.getDestinationAirport().getIataCode())
                        .time(flight.getArrivalTime())
                        .build())
                .fareOptions(fareDtos)
                .build();
    }
}