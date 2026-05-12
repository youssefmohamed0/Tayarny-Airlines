package alex.uni.flight_reservation_system.modules.flights;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightSeatStatusService seatStatusService;

    @Autowired
    public FlightService(FlightRepository flightRepository, FlightSeatStatusService seatStatusService) {
        this.flightRepository = flightRepository;
        this.seatStatusService = seatStatusService;
    }

    // USER FUNCTIONS

    public List<Flight> searchFlights(UUID originId, UUID destinationId, LocalDate date, int travelersCount) {
        // Convert the specific date into a full 24-hour window (00:00:00 to 23:59:59)
        // so the database can match exact departure times.
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        return flightRepository.searchAvailableFlights(originId, destinationId, startOfDay, endOfDay, travelersCount);
    }

    public Flight getFlightById(UUID flightId) {
        return flightRepository.findByIdWithDetails(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + flightId));
    }

    public List<Flight> getAllFlights() {
        return flightRepository.findAllWithDetails();
    }

    // ADMIN FUNCTIONS

    public Flight addFlight(Flight flight) {
        // Save the flight to the database to generate its UUID
        Flight savedFlight = flightRepository.save(flight);

        // Immediately tell the SeatService to generate all empty seats for this
        // airplane
        seatStatusService.initializeSeatsForFlight(savedFlight);

        return savedFlight;
    }

    public Flight updateFlight(Flight flight) {
        // Safety check to ensure we aren't creating a duplicate by accident
        if (!flightRepository.existsById(flight.getId())) {
            throw new RuntimeException("Cannot update. Flight not found with ID: " + flight.getId());
        }
        return flightRepository.save(flight);
    }

    public void updateFlightStatus(UUID flightId, String status) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + flightId));

        flight.setStatus(status);
        flightRepository.save(flight);
    }

    public void deleteFlight(UUID flightId) {
        if (!flightRepository.existsById(flightId)) {
            throw new RuntimeException("Cannot delete. Flight not found with ID: " + flightId);
        }
        flightRepository.deleteById(flightId);
    }

    public List<Flight> getFlightByNumber(String flightNumber) {
        return flightRepository.findByFlightNumber(flightNumber)
                .map(List::of) // Wraps the single flight in a list
                .orElse(List.of()); // Returns empty list if not found
    }
}