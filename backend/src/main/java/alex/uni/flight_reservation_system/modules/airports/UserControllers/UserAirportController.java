package alex.uni.flight_reservation_system.modules.airports.UserControllers;

import alex.uni.flight_reservation_system.modules.airports.dto.AirportDto;
import alex.uni.flight_reservation_system.modules.airports.services.AirportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Customer-facing read-only airport endpoints.
 * Secured by SecurityConfig: /api/user/** → ROLE_CUSTOMER
 *
 * Primary use-case: autocomplete/search when the user types in the
 * origin/destination field of the flight-search form.
 */
@RestController
@RequestMapping("/api/user/airports")
public class UserAirportController {

    private final AirportService airportService;

    public UserAirportController(AirportService airportService) {
        this.airportService = airportService;
    }

    // GET /api/user/airports?keyword=cairo
    // The frontend calls this on every keystroke; blank keyword → all airports
    @GetMapping
    public ResponseEntity<List<AirportDto>> search(
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(airportService.search(keyword));
    }

    // GET /api/user/airports/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return airportService.get(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airport not found"));
    }

    // GET /api/user/airports/iata/{code}  — quick lookup by 3-letter IATA code
    @GetMapping("/iata/{code}")
    public ResponseEntity<?> getByIataCode(@PathVariable String code) {
        return airportService.getByIataCode(code)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Airport with IATA code '" + code.toUpperCase() + "' not found"));
    }
}
