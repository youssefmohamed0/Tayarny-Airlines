package alex.uni.flight_reservation_system.modules.airplanes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AirplaneRepository extends JpaRepository<Airplane, UUID> {

    List<Airplane> findByModel(AirplaneModel model);

    List<Airplane> findByModelId(UUID modelId);

    List<Airplane> findByCondition(String condition);

    List<Airplane> findByModelIdAndCondition(UUID modelId, String condition);
}