package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import alex.uni.flight_reservation_system.common.enums.FlightSeatStatusEnum;
import alex.uni.flight_reservation_system.common.enums.PassengerType;
import alex.uni.flight_reservation_system.common.enums.ReservationStatus;
import alex.uni.flight_reservation_system.modules.fare_options.FareOption;
import alex.uni.flight_reservation_system.modules.fare_options.FareOptionRepository;
import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightRepository;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatus;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatusRepository;
import alex.uni.flight_reservation_system.modules.reservations.dto.AdminReservationResponse;
import alex.uni.flight_reservation_system.modules.reservations.dto.CheckoutRequest;
import alex.uni.flight_reservation_system.modules.reservations.dto.ReservationResponse;
import alex.uni.flight_reservation_system.modules.reservations.dto.TravelerInfo;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.seats.SeatRepository;
import alex.uni.flight_reservation_system.modules.tickets.Ticket;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.users.UserRepository;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FlightReservationService {

    @Autowired
    private FlightReservationRepository reservationRepository;
    @Autowired
    private FlightRepository flightRepository;
    @Autowired
    private FareOptionRepository fareOptionRepository;
    @Autowired
    private FlightSeatStatusRepository seatStatusRepository;
    @Autowired
    private SeatRepository seatRepository;
    @Autowired
    private UserRepository userRepository;

    // =========================================================================
    // CHECKOUT — atomic booking transaction
    // =========================================================================
    @Transactional
    public ReservationResponse checkout(CheckoutRequest request) {
        // 0. Get authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Validate card expiry
        validateCardExpiry(request.getCardExpiryDate());

        // 2. Resolve flight
        Flight flight = flightRepository.findByFlightNumber(request.getFlightNumber())
                .orElseThrow(() -> new RuntimeException("Flight not found: " + request.getFlightNumber()));

        // 3. Resolve fare option
        FareOption fareOption = fareOptionRepository
                .findByFlightIdAndCabinClass(flight.getId(), request.getFareClass())
                .orElseThrow(() -> new RuntimeException(
                        "Fare class " + request.getFareClass() + " not found for flight " + request.getFlightNumber()));

        // 4. Check enough seats available
        List<TravelerInfo> travelers = request.getTravelers();
        if (travelers.size() > fareOption.getAvailableSeats()) {
            throw new RuntimeException("Not enough available seats. Requested: " + travelers.size()
                    + ", Available: " + fareOption.getAvailableSeats());
        }

        // 5. Resolve seat names → Seat entities
        List<String> seatNames = travelers.stream()
                .map(TravelerInfo::getAssignedSeat)
                .collect(Collectors.toList());
        UUID modelId = flight.getAirplane().getModel().getId();
        List<Seat> seats = seatRepository.findByAirplaneModelIdAndSeatNumIn(modelId, seatNames);

        if (seats.size() != seatNames.size()) {
            List<String> foundNames = seats.stream().map(Seat::getSeatNum).toList();
            List<String> missing = seatNames.stream().filter(n -> !foundNames.contains(n)).toList();
            throw new RuntimeException("Invalid seat(s): " + missing);
        }

        // 6. Lock seats (SELECT FOR UPDATE) — prevents race conditions
        List<UUID> seatIds = seats.stream().map(Seat::getId).collect(Collectors.toList());
        List<FlightSeatStatus> seatStatuses = seatStatusRepository
                .findByFlightIdAndSeatIdsForUpdate(flight.getId(), seatIds);

        // 7. Check all seats are AVAILABLE
        for (FlightSeatStatus status : seatStatuses) {
            if (status.getStatus() != FlightSeatStatusEnum.AVAILABLE) {
                throw new RuntimeException("Seat " + status.getSeat().getSeatNum() + " is not available");
            }
        }

        // 8. Mark seats as OCCUPIED
        for (FlightSeatStatus status : seatStatuses) {
            status.setStatus(FlightSeatStatusEnum.OCCUPIED);
        }
        seatStatusRepository.saveAll(seatStatuses);

        // 9. Calculate total price
        long adultCount = travelers.stream()
                .filter(t -> "ADULT".equalsIgnoreCase(t.getType()))
                .count();
        long childCount = travelers.stream()
                .filter(t -> "CHILD".equalsIgnoreCase(t.getType()))
                .count();
        double totalPrice = (adultCount * fareOption.getPricePerAdult())
                + (childCount * fareOption.getPricePerChild());

        // 10. Create reservation
        FlightReservation reservation = new FlightReservation();
        reservation.setUser(user);
        reservation.setFareOption(fareOption);
        reservation.setNumSeats(travelers.size());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.CONFIRMED);

        // 11. Create tickets
        Map<String, Seat> seatMap = seats.stream()
                .collect(Collectors.toMap(Seat::getSeatNum, s -> s));

        List<Ticket> tickets = new ArrayList<>();
        for (TravelerInfo traveler : travelers) {
            Ticket ticket = new Ticket();
            ticket.setReservation(reservation);
            ticket.setSeat(seatMap.get(traveler.getAssignedSeat()));
            ticket.setPassengerName(traveler.getFullName());
            ticket.setPassengerType(PassengerType.valueOf(traveler.getType().toUpperCase()));
            ticket.setPrice("ADULT".equalsIgnoreCase(traveler.getType())
                    ? fareOption.getPricePerAdult()
                    : fareOption.getPricePerChild());
            ticket.setPassportNumber(traveler.getPassportNumber());
            if (traveler.getDateOfBirth() != null && !traveler.getDateOfBirth().isBlank()) {
                ticket.setDateOfBirth(LocalDate.parse(traveler.getDateOfBirth()));
            }
            tickets.add(ticket);
        }
        reservation.setTickets(tickets);

        // 12. Save reservation (cascade saves tickets)
        reservation = reservationRepository.save(reservation);

        // 13. Decrement available seats on fare option
        fareOption.setAvailableSeats(fareOption.getAvailableSeats() - travelers.size());
        fareOptionRepository.save(fareOption);

        return toReservationResponse(reservation);
    }

    // =========================================================================
    // USER — booking history (readOnly keeps a session open for lazy loading)
    // =========================================================================
    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyReservations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reservationRepository.findByUserIdOrderByFareOptionFlightDepartureTimeDesc(user.getId())
                .stream()
                .map(this::toReservationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationResponse getMyReservation(UUID reservationId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FlightReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Reservation does not belong to this user");
        }

        return toReservationResponse(reservation);
    }

    // =========================================================================
    // USER — cancel reservation
    // =========================================================================
    @Transactional
    public ReservationResponse cancelReservation(UUID reservationId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FlightReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Reservation does not belong to this user");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }

        // 1. Mark seats as AVAILABLE
        List<UUID> seatIds = reservation.getTickets().stream()
                .map(t -> t.getSeat().getId())
                .collect(Collectors.toList());

        Flight flight = reservation.getFareOption().getFlight();
        List<FlightSeatStatus> seatStatuses = seatStatusRepository
                .findByFlightIdAndSeatIdsForUpdate(flight.getId(), seatIds);

        for (FlightSeatStatus status : seatStatuses) {
            status.setStatus(FlightSeatStatusEnum.AVAILABLE);
        }
        seatStatusRepository.saveAll(seatStatuses);

        // 2. Increment available seats on fare option
        FareOption fareOption = reservation.getFareOption();
        fareOption.setAvailableSeats(fareOption.getAvailableSeats() + reservation.getNumSeats());
        fareOptionRepository.save(fareOption);

        // 3. Mark reservation as cancelled
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation = reservationRepository.save(reservation);

        return toReservationResponse(reservation);
    }

    // =========================================================================
    // ADMIN — all reservations
    // =========================================================================
    @Transactional(readOnly = true)
    public List<AdminReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::toAdminReservationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminReservationResponse getReservationAdmin(UUID reservationId) {
        FlightReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        return toAdminReservationResponse(reservation);
    }

    // =========================================================================
    // MAPPERS
    // =========================================================================
    private ReservationResponse toReservationResponse(FlightReservation r) {
        Flight flight = r.getFareOption().getFlight();
        return ReservationResponse.builder()
                .id(r.getId())
                .flightNumber(flight.getFlightNumber())
                .originAirport(flight.getOriginAirport().getName())
                .originCity(flight.getOriginAirport().getCity())
                .destinationAirport(flight.getDestinationAirport().getName())
                .destinationCity(flight.getDestinationAirport().getCity())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .fareName(r.getFareOption().getFareName())
                .cabinClass(r.getFareOption().getCabinClass())
                .numSeats(r.getNumSeats())
                .totalPrice(r.getTotalPrice())
                .status(r.getStatus().name())
                .tickets(r.getTickets() != null
                        ? r.getTickets().stream().map(this::toTicketResponse).collect(Collectors.toList())
                        : List.of())
                .build();
    }

    private AdminReservationResponse toAdminReservationResponse(FlightReservation r) {
        Flight flight = r.getFareOption().getFlight();
        User user = r.getUser();
        return AdminReservationResponse.builder()
                .id(r.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .flightNumber(flight.getFlightNumber())
                .originAirport(flight.getOriginAirport().getName())
                .originCity(flight.getOriginAirport().getCity())
                .destinationAirport(flight.getDestinationAirport().getName())
                .destinationCity(flight.getDestinationAirport().getCity())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .fareName(r.getFareOption().getFareName())
                .cabinClass(r.getFareOption().getCabinClass())
                .numSeats(r.getNumSeats())
                .totalPrice(r.getTotalPrice())
                .status(r.getStatus().name())
                .tickets(r.getTickets() != null
                        ? r.getTickets().stream().map(this::toTicketResponse).collect(Collectors.toList())
                        : List.of())
                .build();
    }

    private TicketResponse toTicketResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .passengerName(t.getPassengerName())
                .passengerType(t.getPassengerType().name())
                .seatNumber(t.getSeat().getSeatNum())
                .seatClass(t.getSeat().getSeatClass().name())
                .seatPosition(t.getSeat().getPosition().name())
                .price(t.getPrice())
                .passportNumber(t.getPassportNumber())
                .dateOfBirth(t.getDateOfBirth())
                .build();
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    private void validateCardExpiry(String cardExpiryDate) {
        try {
            // Parse "MM/yyyy" format
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/yyyy");
            YearMonth expiry = YearMonth.parse(cardExpiryDate, formatter);
            if (expiry.isBefore(YearMonth.now())) {
                throw new RuntimeException("Credit card has expired");
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Invalid card expiry date format. Expected MM/yyyy");
        }
    }
}
