package alex.uni.flight_reservation_system.modules.airports.services;

import alex.uni.flight_reservation_system.modules.airports.Airport;
import alex.uni.flight_reservation_system.modules.airports.AirportRepository;
import alex.uni.flight_reservation_system.modules.airports.dto.AirportDto;
import alex.uni.flight_reservation_system.modules.airports.dto.CreateAirportRequest;
import alex.uni.flight_reservation_system.modules.airports.dto.UpdateAirportRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AirportService {

    private final AirportRepository airportRepository;

    public AirportService(AirportRepository airportRepository) {
        this.airportRepository = airportRepository;
    }

    // ── Search (main feature) ────────────────────────────────────────────────

    /**
     * Case-insensitive partial match against name, city, country, and IATA code.
     * The frontend sends whatever characters the user has typed; we return every
     * matching airport so the UI can render an autocomplete list.
     */
    public List<AirportDto> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return airportRepository.findAll()
                    .stream()
                    .map(AirportDto::from)
                    .toList();
        }
        return airportRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(AirportDto::from)
                .toList();
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<AirportDto> list() {
        return airportRepository.findAll()
                .stream()
                .map(AirportDto::from)
                .toList();
    }

    public Optional<AirportDto> get(UUID id) {
        return airportRepository.findById(id).map(AirportDto::from);
    }

    public Optional<AirportDto> getByIataCode(String iataCode) {
        return airportRepository.findByIataCode(iataCode.toUpperCase()).map(AirportDto::from);
    }

    @Transactional
    public AirportDto create(CreateAirportRequest request) {
        String iata = request.iataCode().toUpperCase();
        if (airportRepository.existsByIataCode(iata)) {
            throw new IllegalArgumentException("Airport with IATA code '" + iata + "' already exists");
        }

        Airport airport = new Airport();
        airport.setName(request.name());
        airport.setCity(request.city());
        airport.setCountry(request.country());
        airport.setIataCode(iata);

        return AirportDto.from(airportRepository.save(airport));
    }

    @Transactional
    public Optional<AirportDto> update(UUID id, UpdateAirportRequest request) {
        return airportRepository.findById(id).map(airport -> {
            if (request.name()    != null && !request.name().isBlank())    airport.setName(request.name());
            if (request.city()    != null && !request.city().isBlank())    airport.setCity(request.city());
            if (request.country() != null && !request.country().isBlank()) airport.setCountry(request.country());
            if (request.iataCode() != null && !request.iataCode().isBlank()) {
                String iata = request.iataCode().toUpperCase();
                if (!iata.equals(airport.getIataCode()) && airportRepository.existsByIataCode(iata)) {
                    throw new IllegalArgumentException("Airport with IATA code '" + iata + "' already exists");
                }
                airport.setIataCode(iata);
            }
            return AirportDto.from(airportRepository.save(airport));
        });
    }

    @Transactional
    public boolean delete(UUID id) {
        if (!airportRepository.existsById(id)) {
            return false;
        }
        airportRepository.deleteById(id);
        return true;
    }
}
