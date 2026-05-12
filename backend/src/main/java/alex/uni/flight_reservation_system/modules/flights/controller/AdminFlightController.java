package alex.uni.flight_reservation_system.modules.flights.controller;

import alex.uni.flight_reservation_system.modules.flights.FlightService;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminFlightController {

    private final FlightService flightService;

    @Autowired
    public AdminFlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    // ==========================================
    // 1. GET FLIGHTS (With optional filters)
    // GET /api/admin/flight?flightNumber=MS777
    // ==========================================
    @GetMapping("/flight")
    public ResponseEntity<List<AdminFlightResponse>> getFlights(
            @RequestParam(required = false) String flightNumber) {
        List<AdminFlightResponse> responses = flightService.getAdminFlights(flightNumber);
        return ResponseEntity.ok(responses);
    }

    // ==========================================
    // 2. ADD FLIGHT
    // POST /api/admin/flight
    // ==========================================
    @PostMapping("/flight")
    public ResponseEntity<AdminFlightResponse> addFlight(@RequestBody AdminFlightRequest request) {
        AdminFlightResponse response = flightService.addAdminFlight(request);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 3. MODIFY FLIGHT
    // PUT /api/admin/flight?flightId=98765
    // ==========================================
    @PutMapping("/flight")
    public ResponseEntity<AdminFlightResponse> modifyFlight(
            @RequestParam UUID flightId,
            @RequestBody AdminFlightRequest request) {
        AdminFlightResponse response = flightService.modifyAdminFlight(flightId, request);
        return ResponseEntity.ok(response);
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
}