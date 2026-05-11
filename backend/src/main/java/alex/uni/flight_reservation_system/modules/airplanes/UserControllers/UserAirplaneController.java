package alex.uni.flight_reservation_system.modules.airplanes.UserControllers;

import alex.uni.flight_reservation_system.modules.airplanes.dto.AirplaneDto;
import alex.uni.flight_reservation_system.modules.airplanes.services.AirplaneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/airplanes")
public class UserAirplaneController {

    private final AirplaneService airplaneService;

    public UserAirplaneController(AirplaneService airplaneService) {
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
}
