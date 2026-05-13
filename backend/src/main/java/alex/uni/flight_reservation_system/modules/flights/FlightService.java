package alex.uni.flight_reservation_system.modules.flights;

import alex.uni.flight_reservation_system.modules.airplanes.Airplane;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneModel;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneModelRepository;
import alex.uni.flight_reservation_system.modules.airplanes.AirplaneRepo.AirplaneRepository;
import alex.uni.flight_reservation_system.modules.airports.Airport;
import alex.uni.flight_reservation_system.modules.airports.AirportRepository;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionService;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightResponse;
import alex.uni.flight_reservation_system.modules.flights.dto.FlightSearchRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.UserFlightSearchResponse;
import alex.uni.flight_reservation_system.common.enums.FlightStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FlightService {

    private final FlightRepository flightRepository;
    private final FlightSeatStatusService seatStatusService;
    private final FareOptionService fareOptionService;
    private final AirplaneRepository airplaneRepository;
    private final AirplaneModelRepository airplaneModelRepository;
    private final AirportRepository airportRepository;

    @Autowired
    public FlightService(FlightRepository flightRepository,
                         FlightSeatStatusService seatStatusService,
                         FareOptionService fareOptionService,
                         AirplaneRepository airplaneRepository,
                         AirplaneModelRepository airplaneModelRepository,
                         AirportRepository airportRepository) {
        this.flightRepository = flightRepository;
        this.seatStatusService = seatStatusService;
        this.fareOptionService = fareOptionService;
        this.airplaneRepository = airplaneRepository;
        this.airplaneModelRepository = airplaneModelRepository;
        this.airportRepository = airportRepository;
    }

    // ==========================================
    // EXISTING INTERNAL/OTHER MODULE FUNCTIONS
    // ==========================================

    public List<Flight> searchFlights(UUID originId, UUID destinationId, LocalDate date, int travelersCount) {
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

    public Flight addFlight(Flight flight) {
        Flight savedFlight = flightRepository.save(flight);
        seatStatusService.initializeSeatsForFlight(savedFlight);
        return savedFlight;
    }

    public Flight updateFlight(Flight flight) {
        if (!flightRepository.existsById(flight.getId())) {
            throw new RuntimeException("Cannot update. Flight not found with ID: " + flight.getId());
        }
        return flightRepository.save(flight);
    }

    public void updateFlightStatus(UUID flightId, FlightStatus status) {
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
                .map(List::of)
                .orElse(List.of());
    }

    // ==========================================
    // USER FUNCTIONS (NEW ARCHITECTURE)
    // ==========================================

    public UserFlightSearchResponse searchUserFlights(FlightSearchRequest request) {
        Airport origin = airportRepository.findByIataCode(request.getOrigin())
                .orElseThrow(() -> new RuntimeException("Origin airport not found: " + request.getOrigin()));
        Airport destination = airportRepository.findByIataCode(request.getDestination())
                .orElseThrow(() -> new RuntimeException("Destination airport not found: " + request.getDestination()));

        int totalTravelers = request.getTravelers().getAdults() + request.getTravelers().getChildren();
        LocalDateTime startOfDay = request.getDepartureDate().atStartOfDay();
        LocalDateTime endOfDay = request.getDepartureDate().atTime(23, 59, 59);

        List<Flight> flights = flightRepository.searchAvailableFlights(
                origin.getId(), destination.getId(), startOfDay, endOfDay, totalTravelers);

        List<UserFlightSearchResponse.FlightDto> flightDtos = flights.stream()
                .map(flight -> mapToUserFlightDto(flight, request))
                .collect(Collectors.toList());

        return UserFlightSearchResponse.builder().flights(flightDtos).build();
    }

    public List<FlightSeatStatus> getSeatMapForFlight(UUID flightId) {
        return seatStatusService.getSeatMapForFlight(flightId);
    }

    private UserFlightSearchResponse.FlightDto mapToUserFlightDto(Flight flight, FlightSearchRequest request) {
        int adults = request.getTravelers().getAdults();
        int children = request.getTravelers().getChildren();

        List<FareOption> fareOptions = fareOptionService.getFareOptionsForFlight(flight.getId());

        if (request.getCabinClass() != null && !request.getCabinClass().isEmpty()) {
            fareOptions = fareOptions.stream()
                    .filter(f -> f.getCabinClass().equalsIgnoreCase(request.getCabinClass()))
                    .collect(Collectors.toList());
        }

        List<UserFlightSearchResponse.UserFareOptionDto> fareDtos = fareOptions.stream()
                .map(fare -> {
                    double adultTotal = adults * fare.getPricePerAdult();
                    double childTotal = children * fare.getPricePerChild();
                    double totalPrice = adultTotal + childTotal;

                    return UserFlightSearchResponse.UserFareOptionDto.builder()
                            .fareName(fare.getFareName())
                            .totalPrice(totalPrice)
                            .priceBreakdown(UserFlightSearchResponse.PriceBreakdownDto.builder()
                                    .adult(UserFlightSearchResponse.PassengerPriceDto.builder()
                                            .count(adults)
                                            .farePerPassenger(fare.getPricePerAdult())
                                            .build())
                                    .child(UserFlightSearchResponse.PassengerPriceDto.builder()
                                            .count(children)
                                            .farePerPassenger(fare.getPricePerChild())
                                            .build())
                                    .build())
                            .benefits(fare.getBenefits())
                            .availableSeats(fare.getAvailableSeats())
                            .build();
                })
                .collect(Collectors.toList());

        return UserFlightSearchResponse.FlightDto.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .aircraft(flight.getAirplane().getModel().getModelName())
                .departure(UserFlightSearchResponse.DepartureDto.builder()
                        .airport(flight.getOriginAirport().getIataCode())
                        .terminal(flight.getTerminal())
                        .time(flight.getDepartureTime())
                        .build())
                .arrival(UserFlightSearchResponse.ArrivalDto.builder()
                        .airport(flight.getDestinationAirport().getIataCode())
                        .time(flight.getArrivalTime())
                        .build())
                .fareOptions(fareDtos)
                .build();
    }

    // ==========================================
    // ADMIN FUNCTIONS (NEW ARCHITECTURE)
    // ==========================================

    public List<AdminFlightResponse> getAdminFlights(String flightNumber) {
        List<Flight> flights;
        if (flightNumber != null && !flightNumber.isEmpty()) {
            flights = flightRepository.findByFlightNumber(flightNumber)
                    .map(List::of)
                    .orElse(List.of());
        } else {
            flights = flightRepository.findAllWithDetails();
        }

        return flights.stream().map(this::mapToAdminResponse).collect(Collectors.toList());
    }

    @Transactional
    public AdminFlightResponse addAdminFlight(AdminFlightRequest request) {
        Flight flight = mapRequestToEntity(request);
        Flight savedFlight = flightRepository.save(flight);
        seatStatusService.initializeSeatsForFlight(savedFlight);
        saveFareOptions(request.getFareOptions(), savedFlight);
        return mapToAdminResponse(flightRepository.findByIdWithDetails(savedFlight.getId()).orElseThrow());
    }

    @Transactional
    public AdminFlightResponse modifyAdminFlight(UUID flightId, AdminFlightRequest request) {
        Flight flight = flightRepository.findByIdWithDetails(flightId)
                .orElseThrow(() -> new RuntimeException("Cannot update. Flight not found with ID: " + flightId));

        updateFlightFromRequest(flight, request);
        Flight updatedFlight = flightRepository.save(flight);

        List<FareOption> existingFares = fareOptionService.getFareOptionsForFlight(flightId);
        for (FareOption fare : existingFares) {
            fareOptionService.deleteFareOption(fare.getId());
        }
        saveFareOptions(request.getFareOptions(), updatedFlight);

        return mapToAdminResponse(flightRepository.findByIdWithDetails(updatedFlight.getId()).orElseThrow());
    }

    private Flight mapRequestToEntity(AdminFlightRequest request) {
        Flight flight = new Flight();
        flight.setFlightNumber(request.getFlightNumber());
        flight.setDepartureTime(request.getDeparture().getTime());
        flight.setArrivalTime(request.getArrival().getTime());
        flight.setTerminal(request.getDeparture().getTerminal());
        flight.setStatus(FlightStatus.SCHEDULED);

        Airport origin = airportRepository.findByIataCode(request.getDeparture().getAirport())
                .orElseThrow(() -> new RuntimeException("Origin airport not found: " + request.getDeparture().getAirport()));
        flight.setOriginAirport(origin);

        Airport destination = airportRepository.findByIataCode(request.getArrival().getAirport())
                .orElseThrow(() -> new RuntimeException("Destination airport not found: " + request.getArrival().getAirport()));
        flight.setDestinationAirport(destination);

        AirplaneModel model = airplaneModelRepository.findByModelName(request.getAircraft())
                .orElseThrow(() -> new RuntimeException("Airplane model not found: " + request.getAircraft()));
        List<Airplane> airplanes = airplaneRepository.findByModel(model);
        if (airplanes.isEmpty()) {
            throw new RuntimeException("No airplanes available for model: " + request.getAircraft());
        }
        flight.setAirplane(airplanes.get(0));

        return flight;
    }

    private void updateFlightFromRequest(Flight flight, AdminFlightRequest request) {
        flight.setFlightNumber(request.getFlightNumber());
        flight.setDepartureTime(request.getDeparture().getTime());
        flight.setArrivalTime(request.getArrival().getTime());
        flight.setTerminal(request.getDeparture().getTerminal());

        Airport origin = airportRepository.findByIataCode(request.getDeparture().getAirport())
                .orElseThrow(() -> new RuntimeException("Origin airport not found: " + request.getDeparture().getAirport()));
        flight.setOriginAirport(origin);

        Airport destination = airportRepository.findByIataCode(request.getArrival().getAirport())
                .orElseThrow(() -> new RuntimeException("Destination airport not found: " + request.getArrival().getAirport()));
        flight.setDestinationAirport(destination);

        AirplaneModel model = airplaneModelRepository.findByModelName(request.getAircraft())
                .orElseThrow(() -> new RuntimeException("Airplane model not found: " + request.getAircraft()));
        List<Airplane> airplanes = airplaneRepository.findByModel(model);
        if (airplanes.isEmpty()) {
            throw new RuntimeException("No airplanes available for model: " + request.getAircraft());
        }
        flight.setAirplane(airplanes.get(0));
    }

    private void saveFareOptions(List<AdminFlightRequest.AdminFareOptionDto> fareDtos, Flight flight) {
        if (fareDtos == null || fareDtos.isEmpty()) {
            return;
        }

        List<FareOption> fareOptions = fareDtos.stream().map(dto -> {
            FareOption fare = new FareOption();
            fare.setFlight(flight);
            fare.setFareName(dto.getFareName());
            fare.setCabinClass(dto.getFareName()); // Derive cabin class from fare name
            fare.setPricePerAdult(dto.getPricePerSeat());
            fare.setPricePerChild(dto.getPricePerSeat());
            fare.setAvailableSeats(dto.getAvailableSeats());
            fare.setBenefits(dto.getBenefits());
            return fare;
        }).collect(Collectors.toList());

        fareOptionService.addMultipleFareOptions(fareOptions);
    }

    private AdminFlightResponse mapToAdminResponse(Flight flight) {
        List<FareOption> fareOptions = fareOptionService.getFareOptionsForFlight(flight.getId());

        List<AdminFlightResponse.AdminFareOptionDto> fareDtos = fareOptions.stream()
                .map(fare -> AdminFlightResponse.AdminFareOptionDto.builder()
                        .fareName(fare.getFareName())
                        .pricePerSeat(fare.getPricePerAdult())
                        .benefits(fare.getBenefits())
                        .availableSeats(fare.getAvailableSeats())
                        .build())
                .collect(Collectors.toList());

        return AdminFlightResponse.builder()
                .flightId(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .aircraft(flight.getAirplane().getModel().getModelName())
                .status(flight.getStatus())
                .departure(AdminFlightResponse.DepartureDto.builder()
                        .airport(flight.getOriginAirport().getIataCode())
                        .terminal(flight.getTerminal())
                        .time(flight.getDepartureTime())
                        .build())
                .arrival(AdminFlightResponse.ArrivalDto.builder()
                        .airport(flight.getDestinationAirport().getIataCode())
                        .time(flight.getArrivalTime())
                        .build())
                .fareOptions(fareDtos)
                .build();
    }

    // ==========================================
    // BACKGROUND JOBS
    // ==========================================

    @Scheduled(fixedRate = 120000)
    @Transactional
    public void updateCompletedFlights() {
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = flightRepository.updateStatusForArrivedFlights(
                FlightStatus.SCHEDULED,
                FlightStatus.COMPLETED,
                now
        );
        if (updatedCount > 0) {
            System.out.println("Marked " + updatedCount + " flights as COMPLETED");
        }
    }
}