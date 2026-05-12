package alex.uni.flight_reservation_system.modules.fare_options.controller;

import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionService;
import alex.uni.flight_reservation_system.modules.fare_options.dto.FareOptionRequest;
import alex.uni.flight_reservation_system.modules.fare_options.dto.FareOptionResponse;
import alex.uni.flight_reservation_system.modules.flights.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/fare")
@CrossOrigin(origins = "*")
public class AdminFareOptionController {

    private final FareOptionService fareOptionService;
    private final FlightRepository flightRepository;

    @Autowired
    public AdminFareOptionController(FareOptionService fareOptionService, FlightRepository flightRepository) {
        this.fareOptionService = fareOptionService;
        this.flightRepository = flightRepository;
    }

    // ADD FARE: POST /api/admin/fare
    @PostMapping
    public ResponseEntity<FareOptionResponse> addFareOption(@RequestBody FareOptionRequest request) {
        FareOption fareOption = new FareOption();
        fareOption.setFareName(request.getFareName());
        fareOption.setCabinClass(request.getCabinClass());
        fareOption.setPricePerAdult(request.getPricePerAdult());
        fareOption.setPricePerChild(request.getPricePerChild());
        fareOption.setAvailableSeats(request.getAvailableSeats());

        fareOption.setFlight(flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found")));

        FareOption savedFare = fareOptionService.addFareOption(fareOption);
        return ResponseEntity.ok(mapToResponse(savedFare));
    }

    // MODIFY FARE: PUT /api/admin/fare?fareId=...
    @PutMapping
    public ResponseEntity<FareOptionResponse> modifyFareOption(
            @RequestParam UUID fareId,
            @RequestBody FareOptionRequest request) {

        // Assumes your Service has a findById method
        FareOption fareOption = fareOptionService.getFareById(fareId);

        fareOption.setFareName(request.getFareName());
        fareOption.setCabinClass(request.getCabinClass());
        fareOption.setPricePerAdult(request.getPricePerAdult());
        fareOption.setPricePerChild(request.getPricePerChild());
        fareOption.setAvailableSeats(request.getAvailableSeats());

        FareOption updatedFare = fareOptionService.updateFareOption(fareOption);
        return ResponseEntity.ok(mapToResponse(updatedFare));
    }

    // DELETE FARE: DELETE /api/admin/fare?fareId=...
    @DeleteMapping
    public ResponseEntity<Void> deleteFareOption(@RequestParam UUID fareId) {
        fareOptionService.deleteFareOption(fareId);
        return ResponseEntity.noContent().build();
    }

    private FareOptionResponse mapToResponse(FareOption fare) {
        return FareOptionResponse.builder()
                .id(fare.getId())
                .flightId(fare.getFlight().getId())
                .fareName(fare.getFareName())
                .cabinClass(fare.getCabinClass())
                .pricePerAdult(fare.getPricePerAdult())
                .pricePerChild(fare.getPricePerChild())
                .availableSeats(fare.getAvailableSeats())
                .build();
    }
}