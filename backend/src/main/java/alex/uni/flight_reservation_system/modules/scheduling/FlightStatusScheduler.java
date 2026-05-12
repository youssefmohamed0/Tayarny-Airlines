package alex.uni.flight_reservation_system.modules.scheduling;

import alex.uni.flight_reservation_system.common.enums.ReservationStatus;
import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.flights.FlightRepository;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservation;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservationRepository;
import alex.uni.flight_reservation_system.modules.tickets.Ticket;
import alex.uni.flight_reservation_system.modules.tickets.TicketRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class FlightStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(FlightStatusScheduler.class);

    private final FlightRepository flightRepository;
    private final FlightReservationRepository reservationRepository;
    private final TicketRepository ticketRepository;

    @Autowired
    public FlightStatusScheduler(FlightRepository flightRepository,
                                 FlightReservationRepository reservationRepository,
                                 TicketRepository ticketRepository) {
        this.flightRepository = flightRepository;
        this.reservationRepository = reservationRepository;
        this.ticketRepository = ticketRepository;
    }

    /**
     * Runs every 5 minutes.
     * Finds flights whose arrival time is in the past, and updates their status to COMPLETED.
     * Also updates all CONFIRMED reservations and tickets to COMPLETED.
     */
    @Scheduled(cron = "0 0/5 * * * ?")
    @Transactional
    public void markPastFlightsAsCompleted() {
        LocalDateTime now = LocalDateTime.now();
        List<Flight> pastFlights = flightRepository.findByArrivalTimeBeforeAndStatusNot(now, "COMPLETED");

        if (pastFlights.isEmpty()) {
            return;
        }

        logger.info("Found {} flights to mark as COMPLETED.", pastFlights.size());

        for (Flight flight : pastFlights) {
            flight.setStatus("COMPLETED");
            flightRepository.save(flight);

            List<FlightReservation> reservations = reservationRepository.findByFareOptionFlightId(flight.getId());

            for (FlightReservation reservation : reservations) {
                // Only complete reservations that are currently CONFIRMED.
                // Cancelled or already completed reservations should not be affected.
                if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
                    reservation.setStatus(ReservationStatus.COMPLETED);
                    reservationRepository.save(reservation);

                    List<Ticket> tickets = ticketRepository.findByReservationId(reservation.getId());
                    for (Ticket ticket : tickets) {
                        if (ticket.getStatus() == ReservationStatus.CONFIRMED) {
                            ticket.setStatus(ReservationStatus.COMPLETED);
                            ticketRepository.save(ticket);
                        }
                    }
                }
            }
        }

        logger.info("Successfully marked {} flights and their reservations as COMPLETED.", pastFlights.size());
    }
}
