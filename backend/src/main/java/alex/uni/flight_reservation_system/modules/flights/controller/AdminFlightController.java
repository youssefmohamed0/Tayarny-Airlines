package alex.uni.flight_reservation_system.modules.flights.controller;

import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.dto.CreateFlightRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightResponse;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneRepository;
import alex.uni.flight_reservation_system.modules.airports.AirportRepository;
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
    private final AirplaneRepository airplaneRepository;
    private final AirportRepository airportRepository;

    @Autowired
    public AdminFlightController(FlightService flightService,
            AirplaneRepository airplaneRepository,
            AirportRepository airportRepository) {
        this.flightService = flightService;
        this.airplaneRepository = airplaneRepository;
        this.airportRepository = airportRepository;
    }

    // ==========================================
    // 1. GET FLIGHTS (With optional filters)
    // GET /api/admin/flight?flightNumber=MS777
    // ==========================================
    @GetMapping("/flight")
    public ResponseEntity<List<FlightResponse>> getFlights(
            @RequestParam(required = false) String flightNumber) {

        List<Flight> flights;

        if (flightNumber != null && !flightNumber.isEmpty()) {
            // If a number is provided, we find that specific one
            flights = flightService.getFlightByNumber(flightNumber);
        } else {
            // Otherwise, get all
            flights = flightService.getAllFlights();
        }

        return ResponseEntity.ok(flights.stream().map(this::mapToResponse).collect(Collectors.toList()));
    }

    // ==========================================
    // 2. ADD FLIGHT
    // POST /api/admin/flight
    // ==========================================
    @PostMapping("/flight")
    public ResponseEntity<FlightResponse> addFlight(@RequestBody CreateFlightRequest request) {
        Flight flight = new Flight();

        // Map DTO to Entity
        flight.setFlightNumber(request.getFlightNumber());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());

        // Fetch the actual objects using the IDs from the request
        flight.setAirplane(airplaneRepository.findById(request.getAirplaneId())
                .orElseThrow(() -> new RuntimeException("Airplane not found")));
        flight.setOriginAirport(airportRepository.findById(request.getOriginAirportId())
                .orElseThrow(() -> new RuntimeException("Origin Airport not found")));
        flight.setDestinationAirport(airportRepository.findById(request.getDestinationAirportId())
                .orElseThrow(() -> new RuntimeException("Destination Airport not found")));

        Flight savedFlight = flightService.addFlight(flight);
        return ResponseEntity.ok(mapToResponse(savedFlight));
    }

    // ==========================================
    // 3. MODIFY FLIGHT
    // PUT /api/admin/flight?flightId=98765
    // ==========================================
    @PutMapping("/flight")
    public ResponseEntity<FlightResponse> modifyFlight(
            @RequestParam UUID flightId,
            @RequestBody CreateFlightRequest request) {

        // Find existing flight
        Flight flight = flightService.getFlightById(flightId);

        // Update fields
        flight.setFlightNumber(request.getFlightNumber());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());

        Flight updatedFlight = flightService.updateFlight(flight);
        return ResponseEntity.ok(mapToResponse(updatedFlight));
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
    // HELPER: Map Entity to Response DTO
    // ==========================================
    private FlightResponse mapToResponse(Flight flight) {
        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .airplaneModel(flight.getAirplane().getModel().getModelName())
                .originAirportName(flight.getOriginAirport().getName())
                .destinationAirportName(flight.getDestinationAirport().getName())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .status(flight.getStatus())
                .build();
    }
}