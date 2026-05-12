package alex.uni.flight_reservation_system.modules.flights.controller;

import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatus;
import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatusService;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightResponse;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flight")
@CrossOrigin(origins = "*")
public class UserFlightController {

    private final FlightService flightService;
    private final FlightSeatStatusService seatStatusService;

    @Autowired
    public UserFlightController(FlightService flightService, FlightSeatStatusService seatStatusService) {
        this.flightService = flightService;
        this.seatStatusService = seatStatusService;
    }

    // ==========================================
    // 1. SEARCH FLIGHTS
    // Method: POST /api/flight/search
    // ==========================================
    @PostMapping("/search")
    public ResponseEntity<List<FlightResponse>> searchFlights(@RequestBody FlightSearchRequest request) {

        // Calls your FlightService search logic
        List<Flight> flights = flightService.searchFlights(
                request.getOriginAirportId(),
                request.getDestinationAirportId(),
                request.getDepartureDate(),
                request.getTravelersCount());

        // Map the results to clean DTOs for the frontend
        List<FlightResponse> responses = flights.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // ==========================================
    // 2. GET SEAT MAP
    // Method: GET /api/flight/seats?flightId=...
    // ==========================================
    @GetMapping("/seats")
    public ResponseEntity<List<FlightSeatStatus>> getSeatMap(@RequestParam UUID flightId) {

        // Fetches the status (Available/Occupied) for every seat on this flight
        List<FlightSeatStatus> seatMap = seatStatusService.getSeatMapForFlight(flightId);

        return ResponseEntity.ok(seatMap);
    }

    // ==========================================
    // HELPER: Map Entity to Response DTO
    // ==========================================
    private FlightResponse mapToResponse(Flight flight) {
        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                // Using .getModelName() as seen in your Admin code
                .airplaneModel(flight.getAirplane().getModel().getModelName())
                .originAirportName(flight.getOriginAirport().getName())
                .destinationAirportName(flight.getDestinationAirport().getName())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .status(flight.getStatus())
                .build();
    }
}