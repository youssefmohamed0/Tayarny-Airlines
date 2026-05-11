package alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo;

import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test/airplanes")
public class AirplaneRepoTestController {

    private final AirplaneRepository airplaneRepository;
    private final AirplaneModelRepository airplaneModelRepository;

    public AirplaneRepoTestController(
            AirplaneRepository airplaneRepository,
            AirplaneModelRepository airplaneModelRepository
    ) {
        this.airplaneRepository = airplaneRepository;
        this.airplaneModelRepository = airplaneModelRepository;
    }

    @GetMapping("/ping")
    public Map<String, Long> ping() {
        return Map.of(
                "airplaneModels", airplaneModelRepository.count(),
                "airplanes", airplaneRepository.count()
        );
    }

    @GetMapping("/models")
    public List<AirplaneModelDto> listModels() {
        return airplaneModelRepository.findAll().stream()
                .map(AirplaneModelDto::from)
                .toList();
    }

    @PostMapping("/models")
    public ResponseEntity<?> createModel(@RequestBody CreateAirplaneModelRequest request) {
        if (request == null
                || request.modelName() == null || request.modelName().isBlank()
                || request.capacity() == null
                || request.maxRangeKm() == null) {
            return ResponseEntity.badRequest().body("modelName, capacity, maxRangeKm are required");
        }

        AirplaneModel model = new AirplaneModel();
        model.setModelName(request.modelName());
        model.setCapacity(request.capacity());
        model.setMaxRangeKm(request.maxRangeKm());

        AirplaneModel saved = airplaneModelRepository.save(model);
        return ResponseEntity.status(HttpStatus.CREATED).body(AirplaneModelDto.from(saved));
    }

    @GetMapping
    @Transactional
    public List<AirplaneDto> listAirplanes(
            @RequestParam(name = "modelId", required = false) UUID modelId,
            @RequestParam(name = "condition", required = false) String condition
    ) {
        List<Airplane> airplanes;

        if (modelId != null && condition != null && !condition.isBlank()) {
            airplanes = airplaneRepository.findByModelIdAndCondition(modelId, condition);
        } else if (modelId != null) {
            airplanes = airplaneRepository.findByModelId(modelId);
        } else if (condition != null && !condition.isBlank()) {
            airplanes = airplaneRepository.findByCondition(condition);
        } else {
            airplanes = airplaneRepository.findAll();
        }

        return airplanes.stream()
                .map(AirplaneDto::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> createAirplane(@RequestBody CreateAirplaneRequest request) {
        if (request == null
                || request.modelId() == null
                || request.condition() == null || request.condition().isBlank()
                || request.numberOfFlights() == null) {
            return ResponseEntity.badRequest().body("modelId, condition, numberOfFlights are required");
        }

        AirplaneModel model = airplaneModelRepository.findById(request.modelId())
                .orElse(null);
        if (model == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("AirplaneModel not found: " + request.modelId());
        }

        Airplane airplane = new Airplane();
        airplane.setModel(model);
        airplane.setCondition(request.condition());
        airplane.setNumberOfFlights(request.numberOfFlights());

        Airplane saved = airplaneRepository.save(airplane);
        return ResponseEntity.status(HttpStatus.CREATED).body(AirplaneDto.from(saved));
    }

    public record CreateAirplaneModelRequest(String modelName, Integer capacity, Integer maxRangeKm) {
    }

    public record CreateAirplaneRequest(UUID modelId, String condition, Integer numberOfFlights) {
    }

    public record AirplaneModelDto(UUID id, String modelName, Integer capacity, Integer maxRangeKm) {
        static AirplaneModelDto from(AirplaneModel model) {
            return new AirplaneModelDto(model.getId(), model.getModelName(), model.getCapacity(), model.getMaxRangeKm());
        }
    }

    public record AirplaneDto(UUID id, UUID modelId, String modelName, String condition, Integer numberOfFlights) {
        static AirplaneDto from(Airplane airplane) {
            AirplaneModel model = airplane.getModel();
            return new AirplaneDto(
                    airplane.getId(),
                    model != null ? model.getId() : null,
                    model != null ? model.getModelName() : null,
                    airplane.getCondition(),
                    airplane.getNumberOfFlights()
            );
        }
    }
}
