package alex.uni.flight_reservation_system.modules.airplanes.services;

import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneModelRepository;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneRepository;
import alex.uni.flight_reservation_system.modules.airplanes.dto.AirplaneDto;
import alex.uni.flight_reservation_system.modules.airplanes.dto.CreateAirplaneRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AirplaneService {

    private final AirplaneRepository airplaneRepository;
    private final AirplaneModelRepository airplaneModelRepository;

    public AirplaneService(AirplaneRepository airplaneRepository, AirplaneModelRepository airplaneModelRepository) {
        this.airplaneRepository = airplaneRepository;
        this.airplaneModelRepository = airplaneModelRepository;
    }

    @Transactional
    public AirplaneDto create(CreateAirplaneRequest request) {
        AirplaneModel model = airplaneModelRepository.findById(request.modelId())
                .orElseThrow(() -> new IllegalArgumentException("AirplaneModel not found: " + request.modelId()));

        Airplane airplane = new Airplane();
        airplane.setModel(model);
        airplane.setCondition(request.condition());
        airplane.setNumberOfFlights(request.numberOfFlights());

        Airplane saved = airplaneRepository.save(airplane);
        return AirplaneDto.from(saved);
    }

    @Transactional
    public boolean delete(UUID airplaneId) {
        if (!airplaneRepository.existsById(airplaneId)) {
            return false;
        }
        airplaneRepository.deleteById(airplaneId);
        return true;
    }

    @Transactional
    public Optional<AirplaneDto> get(UUID airplaneId) {
        return airplaneRepository.findById(airplaneId).map(AirplaneDto::from);
    }

    @Transactional
    public List<AirplaneDto> list(UUID modelId, String condition) {
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

        return airplanes.stream().map(AirplaneDto::from).toList();
    }
}
