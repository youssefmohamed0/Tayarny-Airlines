package alex.uni.flight_reservation_system.modules.fare_options;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FareOptionService {

    private final FareOptionRepository fareOptionRepository;

    @Autowired
    public FareOptionService(FareOptionRepository fareOptionRepository) {
        this.fareOptionRepository = fareOptionRepository;
    }

    // SYSTEM / USER FUNCTIONS (Used during checkout & search)

    /**
     * Gets the specific price for a specific class.
     * This is the exact method your FlightReservationService will call during
     * Checkout!
     */
    public FareOption getFareByFlightAndClass(UUID flightId, String cabinClass) {
        return fareOptionRepository.findByFlightIdAndCabinClass(flightId, cabinClass)
                .orElseThrow(() -> new RuntimeException("Pricing not found for this flight and cabin class."));
    }

    /**
     * Gets all available pricing options for a single flight.
     * Used by the frontend to show the user the price differences between Economy,
     * Business, etc.
     */
    public List<FareOption> getFareOptionsForFlight(UUID flightId) {
        return fareOptionRepository.findByFlightId(flightId);
    }

    // ADMIN FUNCTIONS (Used when scheduling new flights)

    public FareOption getFareById(UUID fareId) {
        return fareOptionRepository.findById(fareId)
                .orElseThrow(() -> new RuntimeException("Fare option not found with ID: " + fareId));
    }

    public FareOption addFareOption(FareOption fareOption) {
        return fareOptionRepository.save(fareOption);
    }

    /**
     * Helper method to add multiple pricing tiers at once
     * (e.g., saving Economy, Business, and First Class all at the same time)
     */
    public List<FareOption> addMultipleFareOptions(List<FareOption> fareOptions) {
        return fareOptionRepository.saveAll(fareOptions);
    }

    public FareOption updateFareOption(FareOption fareOption) {
        if (!fareOptionRepository.existsById(fareOption.getId())) {
            throw new RuntimeException("Cannot update. Fare option not found.");
        }
        return fareOptionRepository.save(fareOption);
    }

    public void deleteFareOption(UUID fareOptionId) {
        fareOptionRepository.deleteById(fareOptionId);
    }
}