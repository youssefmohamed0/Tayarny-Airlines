package alex.uni.flight_reservation_system.modules.airports.AdminControllers;

import alex.uni.flight_reservation_system.modules.airports.dto.AirportDto;
import alex.uni.flight_reservation_system.modules.airports.dto.CreateAirportRequest;
import alex.uni.flight_reservation_system.modules.airports.dto.UpdateAirportRequest;
import alex.uni.flight_reservation_system.modules.airports.services.AirportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin-only endpoints for full airport management.
 * Secured by SecurityConfig: /api/admin/** → ROLE_ADMIN
 */
@RestController
@RequestMapping("/api/admin/airports")
public class AdminAirportController {

    private final AirportService airportService;

    public AdminAirportController(AirportService airportService) {
        this.airportService = airportService;
    }

    // GET /api/admin/airports?keyword=cairo
    // Returns all airports when keyword is omitted or blank
    @GetMapping
    public ResponseEntity<List<AirportDto>> list(
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(airportService.search(keyword));
    }

    // GET /api/admin/airports/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return airportService.get(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airport not found"));
    }

    // GET /api/admin/airports/iata/{code}  — convenience lookup used by FlightService
    @GetMapping("/iata/{code}")
    public ResponseEntity<?> getByIataCode(@PathVariable String code) {
        return airportService.getByIataCode(code)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airport with IATA code '" + code.toUpperCase() + "' not found"));
    }

    // POST /api/admin/airports
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateAirportRequest request) {
        try {
            AirportDto created = airportService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PATCH /api/admin/airports/{id}  — partial update, only supplied fields are changed
    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id,
                                    @Valid @RequestBody UpdateAirportRequest request) {
        try {
            return airportService.update(id, request)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airport not found"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/admin/airports/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        if (!airportService.delete(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airport not found");
        }
        return ResponseEntity.noContent().build();
    }
}
