package alex.uni.flight_reservation_system.modules.airplanes.AdminControllers;

import alex.uni.flight_reservation_system.modules.airplanes.dto.AirplaneDto;
import alex.uni.flight_reservation_system.modules.airplanes.dto.CreateAirplaneRequest;
import alex.uni.flight_reservation_system.modules.airplanes.services.AirplaneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/airplanes")
public class AdminAirplaneController {

    private final AirplaneService airplaneService;

    public AdminAirplaneController(AirplaneService airplaneService) {
        this.airplaneService = airplaneService;
    }

    @GetMapping
    public ResponseEntity<List<AirplaneDto>> list(
            @RequestParam(required = false) UUID modelId,
            @RequestParam(required = false) String condition
    ) {
        return ResponseEntity.ok(airplaneService.list(modelId, condition));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable UUID id) {
        return airplaneService.get(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airplane not found"));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateAirplaneRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(airplaneService.create(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        boolean deleted = airplaneService.delete(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Airplane not found");
        }
        return ResponseEntity.noContent().build();
    }
}
