package alex.uni.flight_reservation_system.modules.flights.controller;

import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneModelRepository;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneRepository;
import alex.uni.flight_reservation_system.modules.airports.Airport;
import alex.uni.flight_reservation_system.modules.airports.AirportRepository;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionService;
import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminFlightController {

    private final FlightService flightService;
    private final FareOptionService fareOptionService;
    private final AirplaneRepository airplaneRepository;
    private final AirplaneModelRepository airplaneModelRepository;
    private final AirportRepository airportRepository;

    @Autowired
    public AdminFlightController(FlightService flightService,
            FareOptionService fareOptionService,
            AirplaneRepository airplaneRepository,
            AirplaneModelRepository airplaneModelRepository,
            AirportRepository airportRepository) {
        this.flightService = flightService;
        this.fareOptionService = fareOptionService;
        this.airplaneRepository = airplaneRepository;
        this.airplaneModelRepository = airplaneModelRepository;
        this.airportRepository = airportRepository;
    }

    // ==========================================
    // 1. GET FLIGHTS (With optional filters)
    // GET /api/admin/flight?flightNumber=MS777
    // ==========================================
    @GetMapping("/flight")
    public ResponseEntity<List<AdminFlightResponse>> getFlights(
            @RequestParam(required = false) String flightNumber) {

        List<Flight> flights;

        if (flightNumber != null && !flightNumber.isEmpty()) {
            flights = flightService.getFlightByNumber(flightNumber);
        } else {
            flights = flightService.getAllFlights();
        }

        List<AdminFlightResponse> responses = flights.stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // ==========================================
    // 2. ADD FLIGHT
    // POST /api/admin/flight
    // ==========================================
    @PostMapping("/flight")
    public ResponseEntity<AdminFlightResponse> addFlight(@RequestBody AdminFlightRequest request) {
        Flight flight = mapRequestToEntity(request);

        Flight savedFlight = flightService.addFlight(flight);

        // Save nested fare options
        saveFareOptions(request.getFareOptions(), savedFlight);

        return ResponseEntity.ok(mapToAdminResponse(flightService.getFlightById(savedFlight.getId())));
    }

    // ==========================================
    // 3. MODIFY FLIGHT
    // PUT /api/admin/flight?flightId=98765
    // ==========================================
    @PutMapping("/flight")
    public ResponseEntity<AdminFlightResponse> modifyFlight(
            @RequestParam UUID flightId,
            @RequestBody AdminFlightRequest request) {

        Flight flight = flightService.getFlightById(flightId);

        // Update flight fields from the request
        updateFlightFromRequest(flight, request);

        Flight updatedFlight = flightService.updateFlight(flight);

        // Delete existing fare options and re-create from request
        List<FareOption> existingFares = fareOptionService.getFareOptionsForFlight(flightId);
        for (FareOption fare : existingFares) {
            fareOptionService.deleteFareOption(fare.getId());
        }
        saveFareOptions(request.getFareOptions(), updatedFlight);

        return ResponseEntity.ok(mapToAdminResponse(flightService.getFlightById(updatedFlight.getId())));
    }

    // ==========================================
    // 4. DELETE FLIGHT
    // DELETE /api/admin/flight?flightId=...
    // ==========================================
    @DeleteMapping("/flight")
    public ResponseEntity<Void> deleteFlight(@RequestParam UUID flightId) {
        flightService.deleteFlight(flightId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // HELPERS
    // ==========================================

    /**
     * Maps an AdminFlightRequest to a new Flight entity.
     * Resolves IATA codes → Airport entities and aircraft name → Airplane entity.
     */
    private Flight mapRequestToEntity(AdminFlightRequest request) {
        Flight flight = new Flight();

        flight.setFlightNumber(request.getFlightNumber());
        flight.setDepartureTime(request.getDeparture().getTime());
        flight.setArrivalTime(request.getArrival().getTime());
        flight.setTerminal(request.getDeparture().getTerminal());
        flight.setStatus("SCHEDULED");

        // Resolve origin airport by IATA code
        Airport origin = airportRepository.findByIataCode(request.getDeparture().getAirport())
                .orElseThrow(() -> new RuntimeException(
                        "Origin airport not found: " + request.getDeparture().getAirport()));
        flight.setOriginAirport(origin);

        // Resolve destination airport by IATA code
        Airport destination = airportRepository.findByIataCode(request.getArrival().getAirport())
                .orElseThrow(() -> new RuntimeException(
                        "Destination airport not found: " + request.getArrival().getAirport()));
        flight.setDestinationAirport(destination);

        // Resolve airplane by model name (pick the first available airplane of that model)
        AirplaneModel model = airplaneModelRepository.findByModelName(request.getAircraft())
                .orElseThrow(() -> new RuntimeException(
                        "Airplane model not found: " + request.getAircraft()));
        List<Airplane> airplanes = airplaneRepository.findByModel(model);
        if (airplanes.isEmpty()) {
            throw new RuntimeException("No airplanes available for model: " + request.getAircraft());
        }
        flight.setAirplane(airplanes.get(0));

        return flight;
    }

    /**
     * Updates an existing Flight entity fields from the request.
     */
    private void updateFlightFromRequest(Flight flight, AdminFlightRequest request) {
        flight.setFlightNumber(request.getFlightNumber());
        flight.setDepartureTime(request.getDeparture().getTime());
        flight.setArrivalTime(request.getArrival().getTime());
        flight.setTerminal(request.getDeparture().getTerminal());

        Airport origin = airportRepository.findByIataCode(request.getDeparture().getAirport())
                .orElseThrow(() -> new RuntimeException(
                        "Origin airport not found: " + request.getDeparture().getAirport()));
        flight.setOriginAirport(origin);

        Airport destination = airportRepository.findByIataCode(request.getArrival().getAirport())
                .orElseThrow(() -> new RuntimeException(
                        "Destination airport not found: " + request.getArrival().getAirport()));
        flight.setDestinationAirport(destination);

        AirplaneModel model = airplaneModelRepository.findByModelName(request.getAircraft())
                .orElseThrow(() -> new RuntimeException(
                        "Airplane model not found: " + request.getAircraft()));
        List<Airplane> airplanes = airplaneRepository.findByModel(model);
        if (airplanes.isEmpty()) {
            throw new RuntimeException("No airplanes available for model: " + request.getAircraft());
        }
        flight.setAirplane(airplanes.get(0));
    }

    /**
     * Saves fare options from the request DTO list, linking them to the given flight.
     */
    private void saveFareOptions(List<AdminFlightRequest.AdminFareOptionDto> fareDtos, Flight flight) {
        if (fareDtos == null || fareDtos.isEmpty()) {
            return;
        }

        List<FareOption> fareOptions = fareDtos.stream().map(dto -> {
            FareOption fare = new FareOption();
            fare.setFlight(flight);
            fare.setFareName(dto.getFareName());
            fare.setCabinClass(dto.getFareName()); // Derive cabin class from fare name
            fare.setPricePerAdult(dto.getPricePerSeat());
            fare.setPricePerChild(dto.getPricePerSeat());
            fare.setAvailableSeats(dto.getAvailableSeats());
            fare.setBenefits(dto.getBenefits());
            return fare;
        }).collect(Collectors.toList());

        fareOptionService.addMultipleFareOptions(fareOptions);
    }

    /**
     * Maps a Flight entity + its fare options to the admin response DTO.
     */
    private AdminFlightResponse mapToAdminResponse(Flight flight) {
        // Load fare options for this flight
        List<FareOption> fareOptions = fareOptionService.getFareOptionsForFlight(flight.getId());

        List<AdminFlightResponse.AdminFareOptionDto> fareDtos = fareOptions.stream()
                .map(fare -> AdminFlightResponse.AdminFareOptionDto.builder()
                        .fareName(fare.getFareName())
                        .pricePerSeat(fare.getPricePerAdult()) // Using pricePerAdult as the canonical price
                        .benefits(fare.getBenefits())
                        .availableSeats(fare.getAvailableSeats())
                        .build())
                .collect(Collectors.toList());

        return AdminFlightResponse.builder()
                .flightId(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .aircraft(flight.getAirplane().getModel().getModelName())
                .departure(AdminFlightResponse.DepartureDto.builder()
                        .airport(flight.getOriginAirport().getIataCode())
                        .terminal(flight.getTerminal())
                        .time(flight.getDepartureTime())
                        .build())
                .arrival(AdminFlightResponse.ArrivalDto.builder()
                        .airport(flight.getDestinationAirport().getIataCode())
                        .time(flight.getArrivalTime())
                        .build())
                .fareOptions(fareDtos)
                .build();
    }
}