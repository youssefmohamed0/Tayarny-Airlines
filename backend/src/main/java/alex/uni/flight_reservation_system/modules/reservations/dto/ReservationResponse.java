package alex.uni.flight_reservation_system.modules.reservations.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import alex.uni.flight_reservation_system.modules.tickets.dto.TicketResponse;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReservationResponse {

    private UUID id;

    // Flight info
    private String flightNumber;
    private String originAirport;
    private String originCity;
    private String destinationAirport;
    private String destinationCity;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    // Fare info
    private String fareName;
    private String cabinClass;

    // Reservation info
    private int numSeats;
    private double totalPrice;
    private String status;

    private List<TicketResponse> tickets;
}
