package alex.uni.flight_reservation_system.modules.flights;

import alex.uni.flight_reservation_system.common.enums.FlightSeatStatusEnum;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.seats.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FlightSeatStatusService {

    private final FlightSeatStatusRepository flightSeatStatusRepository;
    private final SeatRepository seatRepository;

    @Autowired
    public FlightSeatStatusService(FlightSeatStatusRepository flightSeatStatusRepository,
            SeatRepository seatRepository) {
        this.flightSeatStatusRepository = flightSeatStatusRepository;
        this.seatRepository = seatRepository;
    }

    // SEAT INITIALIZATION (Called by Admin FlightService)
    @Transactional
    public void initializeSeatsForFlight(Flight flight) {
        // Only get seats belonging to this flight's airplane model
        UUID modelId = flight.getAirplane().getModel().getId();
        List<Seat> allSeats = seatRepository.findByAirplaneModelId(modelId);
        List<FlightSeatStatus> initialStatuses = new ArrayList<>();

        for (Seat seat : allSeats) {
            FlightSeatStatus status = new FlightSeatStatus();
            // status.setId(new FlightSeatStatusId(flight.getId(), seat.getId())); // If
            // using composite key
            status.setFlight(flight);
            status.setSeat(seat);
            status.setStatus(FlightSeatStatusEnum.AVAILABLE);
            initialStatuses.add(status);
        }
        flightSeatStatusRepository.saveAll(initialStatuses);
    }

    // USER VIEW (Displaying the seat map)
    public List<FlightSeatStatus> getSeatMapForFlight(UUID flightId) {
        return flightSeatStatusRepository.findByFlightId(flightId);
    }

    // BOOKING
    @Transactional
    public void lockAndBookSeats(UUID flightId, List<UUID> seatIds) {

        // Fetch AND lock the requested seats in the database
        List<FlightSeatStatus> requestedSeats = flightSeatStatusRepository.findByFlightIdAndSeatIdsForUpdate(flightId,
                seatIds);

        // Verify we actually found all the seats we asked for
        if (requestedSeats.size() != seatIds.size()) {
            throw new RuntimeException("One or more seats are invalid for this flight.");
        }

        // Verify that EVERY requested seat is actually AVAILABLE
        for (FlightSeatStatus seat : requestedSeats) {
            if (seat.getStatus() != FlightSeatStatusEnum.AVAILABLE) {
                throw new RuntimeException(
                        "Sorry! Seat " + seat.getSeat().getSeatNum() + " was just booked by someone else.");
            }
        }

        // Change status to BOOKED
        for (FlightSeatStatus seat : requestedSeats) {
            seat.setStatus(FlightSeatStatusEnum.OCCUPIED);
        }

        // Save them all
        flightSeatStatusRepository.saveAll(requestedSeats);
    }
}