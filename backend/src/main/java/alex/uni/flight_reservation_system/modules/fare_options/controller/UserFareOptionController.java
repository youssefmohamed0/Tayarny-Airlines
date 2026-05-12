package alex.uni.flight_reservation_system.modules.fare_options.controller;

import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionService;
import alex.uni.flight_reservation_system.modules.fare_options.dto.FareOptionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fare")
@CrossOrigin(origins = "*")
public class UserFareOptionController {

    private final FareOptionService fareOptionService;

    @Autowired
    public UserFareOptionController(FareOptionService fareOptionService) {
        this.fareOptionService = fareOptionService;
    }

    // GET FARES: GET /api/fare/flight?flightId=...
    @GetMapping("/flight")
    public ResponseEntity<List<FareOptionResponse>> getFaresForFlight(@RequestParam UUID flightId) {
        List<FareOption> fares = fareOptionService.getFareOptionsForFlight(flightId);
        return ResponseEntity.ok(fares.stream().map(this::mapToResponse).collect(Collectors.toList()));
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