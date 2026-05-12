package alex.uni.flight_reservation_system.modules.flights.controller;

import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatus;
import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightSearchRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.UserFlightSearchResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class UserFlightController {

    private final FlightService flightService;

    @Autowired
    public UserFlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    // ==========================================
    // 1. SEARCH FLIGHTS
    // GET /api/flights?origin=CAI&destination=LHR&departureDate=2026-10-30
    // &returnDate=2026-11-25&travelers.adults=2&travelers.children=3&cabinClass=ECONOMY
    //
    // Uses @ModelAttribute to bind flattened query parameters to a nested DTO.
    // This avoids the REST anti-pattern of sending a JSON body on a GET request.
    // ==========================================
    @GetMapping
    public ResponseEntity<UserFlightSearchResponse> searchFlights(
            @ModelAttribute FlightSearchRequest request) {
        UserFlightSearchResponse response = flightService.searchUserFlights(request);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 2. GET SEAT MAP
    // GET /api/flights/seats?flightId=...
    // ==========================================
    @GetMapping("/seats")
    public ResponseEntity<List<FlightSeatStatus>> getSeatMap(@RequestParam UUID flightId) {
        List<FlightSeatStatus> seatMap = flightService.getSeatMapForFlight(flightId);
        return ResponseEntity.ok(seatMap);
    }
}