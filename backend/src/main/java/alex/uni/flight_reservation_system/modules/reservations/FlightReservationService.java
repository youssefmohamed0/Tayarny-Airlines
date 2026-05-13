package alex.uni.flight_reservation_system.modules.reservations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import alex.uni.flight_reservation_system.modules.tickets.TicketRepository;
import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;
import alex.uni.flight_reservation_system.modules.users.User;
import alex.uni.flight_reservation_system.modules.users.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    @Autowired
    private TicketRepository ticketRepository;

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
        String flightNumber = request.getFlightNumber().trim().toUpperCase();
        Flight flight = flightRepository.findByFlightNumber(flightNumber)
                .orElseThrow(() -> new RuntimeException("Flight not found: " + flightNumber));

        if (flight.getStatus() != alex.uni.flight_reservation_system.common.enums.FlightStatus.SCHEDULED) {
            throw new RuntimeException("Cannot book tickets for a flight that is " + flight.getStatus());
        }

        // 3. Resolve fare option
        String fareClass = request.getFareClass().trim().toUpperCase();
        FareOption fareOption = fareOptionRepository
                .findByFlightIdAndCabinClass(flight.getId(), fareClass)
                .orElseThrow(() -> new RuntimeException(
                        "Fare class " + fareClass + " not found for flight " + flightNumber));

        // 4. Check enough seats available
        List<TravelerInfo> travelers = request.getTravelers();
        if (travelers.size() > fareOption.getAvailableSeats()) {
            throw new RuntimeException("Not enough available seats. Requested: " + travelers.size()
                    + ", Available: " + fareOption.getAvailableSeats());
        }

        // 5. Resolve seat names → Seat entities (trim + uppercase for consistent lookup)
        List<String> seatNames = travelers.stream()
                .map(t -> t.getAssignedSeat().trim().toUpperCase())
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
            String travelerType = traveler.getType().trim().toUpperCase();
            String assignedSeat = traveler.getAssignedSeat().trim().toUpperCase();
            ticket.setReservation(reservation);
            ticket.setSeat(seatMap.get(assignedSeat));
            ticket.setPassengerName(traveler.getFullName().trim());
            ticket.setPassengerType(PassengerType.valueOf(travelerType));
            ticket.setStatus(ReservationStatus.CONFIRMED);
            ticket.setPrice("ADULT".equals(travelerType)
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
    public Page<ReservationResponse> getMyReservations(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reservationRepository.findByUserIdOrderByFareOptionFlightDepartureTimeDesc(user.getId(), pageable)
                .map(this::toReservationResponse);
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

        // Check cancellation window: must be at least 24 hours before departure
        Flight flight = reservation.getFareOption().getFlight();
        LocalDateTime departureTime = flight.getDepartureTime();
        LocalDateTime now = LocalDateTime.now();

        if (departureTime.isBefore(now)) {
            throw new RuntimeException("Cannot cancel a reservation for a flight that has already departed");
        }

        if (departureTime.isBefore(now.plusHours(24))) {
            throw new RuntimeException(
                    "Cancellation is only allowed at least 24 hours before departure. "
                            + "Flight departs at " + departureTime);
        }

        return processCancellation(reservation, flight);
    }

    // =========================================================================
    // ADMIN — cancel reservation
    // =========================================================================
    @Transactional
    public AdminReservationResponse adminCancelReservation(UUID reservationId) {
        FlightReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }

        Flight flight = reservation.getFareOption().getFlight();
        LocalDateTime departureTime = flight.getDepartureTime();
        LocalDateTime now = LocalDateTime.now();

        // Admins can cancel up to the time of departure (bypassing the 24-hour rule).
        // If you want admins to cancel even AFTER departure (e.g. for
        // refunds/mistakes),
        // you can remove this check entirely.
        if (departureTime.isBefore(now)) {
            throw new RuntimeException("Cannot cancel a reservation for a flight that has already departed");
        }

        processCancellation(reservation, flight);
        return toAdminReservationResponse(reservation);
    }

    private ReservationResponse processCancellation(FlightReservation reservation, Flight flight) {
        // 1. Mark seats as AVAILABLE
        List<UUID> seatIds = reservation.getTickets().stream()
                .map(t -> t.getSeat().getId())
                .collect(Collectors.toList());

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

        // 3. Mark reservation and its tickets as cancelled
        reservation.setStatus(ReservationStatus.CANCELLED);
        if (reservation.getTickets() != null) {
            for (Ticket ticket : reservation.getTickets()) {
                ticket.setStatus(ReservationStatus.CANCELLED);
            }
        }
        reservation = reservationRepository.save(reservation);

        return toReservationResponse(reservation);
    }

    // =========================================================================
    // USER — cancel ticket
    // =========================================================================
    @Transactional
    public TicketResponse cancelTicket(UUID ticketId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        FlightReservation reservation = ticket.getReservation();

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Ticket does not belong to this user");
        }

        if (ticket.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Ticket is already cancelled");
        }

        Flight flight = reservation.getFareOption().getFlight();
        LocalDateTime departureTime = flight.getDepartureTime();
        LocalDateTime now = LocalDateTime.now();

        if (departureTime.isBefore(now)) {
            throw new RuntimeException("Cannot cancel a ticket for a flight that has already departed");
        }

        if (departureTime.isBefore(now.plusHours(24))) {
            throw new RuntimeException(
                    "Cancellation is only allowed at least 24 hours before departure. "
                            + "Flight departs at " + departureTime);
        }

        return processTicketCancellation(ticket, reservation, flight);
    }

    // =========================================================================
    // ADMIN — cancel ticket
    // =========================================================================
    @Transactional
    public TicketResponse adminCancelTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Ticket is already cancelled");
        }

        FlightReservation reservation = ticket.getReservation();
        Flight flight = reservation.getFareOption().getFlight();
        LocalDateTime departureTime = flight.getDepartureTime();
        LocalDateTime now = LocalDateTime.now();

        if (departureTime.isBefore(now)) {
            throw new RuntimeException("Cannot cancel a ticket for a flight that has already departed");
        }

        return processTicketCancellation(ticket, reservation, flight);
    }

    private TicketResponse processTicketCancellation(Ticket ticket, FlightReservation reservation, Flight flight) {
        // 1. Mark seat as AVAILABLE
        List<FlightSeatStatus> seatStatuses = seatStatusRepository
                .findByFlightIdAndSeatIdsForUpdate(flight.getId(), List.of(ticket.getSeat().getId()));

        for (FlightSeatStatus status : seatStatuses) {
            status.setStatus(FlightSeatStatusEnum.AVAILABLE);
        }
        seatStatusRepository.saveAll(seatStatuses);

        // 2. Increment available seats on fare option
        FareOption fareOption = reservation.getFareOption();
        fareOption.setAvailableSeats(fareOption.getAvailableSeats() + 1);
        fareOptionRepository.save(fareOption);

        // 3. Update reservation (price, num_seats)
        reservation.setNumSeats(reservation.getNumSeats() - 1);
        reservation.setTotalPrice(reservation.getTotalPrice() - ticket.getPrice());

        // 4. Mark ticket as cancelled
        ticket.setStatus(ReservationStatus.CANCELLED);
        ticket = ticketRepository.save(ticket);

        if (reservation.getNumSeats() == 0) {
            reservation.setStatus(ReservationStatus.CANCELLED);
        }
        reservationRepository.save(reservation);

        return toTicketResponse(ticket);
    }

    // =========================================================================
    // ADMIN — all reservations

    // =========================================================================
    @Transactional(readOnly = true)
    public Page<AdminReservationResponse> getAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable)
                .map(this::toAdminReservationResponse);
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
                .status(t.getStatus() != null ? t.getStatus().name() : null)
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
