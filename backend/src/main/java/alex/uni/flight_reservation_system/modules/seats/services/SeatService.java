package alex.uni.flight_reservation_system.modules.seats.services;

import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatus;
import alex.uni.flight_reservation_system.modules.flights.FlightSeatStatusRepository;
import alex.uni.flight_reservation_system.modules.seats.Seat;
import alex.uni.flight_reservation_system.modules.seats.SeatRepository;
import alex.uni.flight_reservation_system.modules.seats.dto.SeatDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final FlightSeatStatusRepository flightSeatStatusRepository;

    public SeatService(SeatRepository seatRepository, FlightSeatStatusRepository flightSeatStatusRepository) {
        this.seatRepository = seatRepository;
        this.flightSeatStatusRepository = flightSeatStatusRepository;
    }

    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByModel(UUID modelId) {
        List<Seat> seats = seatRepository.findByAirplaneModelId(modelId);
        return seats.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByFlight(UUID flightId) {
        List<FlightSeatStatus> statuses = flightSeatStatusRepository.findByFlightId(flightId);

        return statuses.stream().map(status -> {
            SeatDto dto = mapToDto(status.getSeat());
            dto.setStatus(status.getStatus().name());
            return dto;
        }).collect(Collectors.toList());
    }

    private SeatDto mapToDto(Seat seat) {
        SeatDto dto = new SeatDto();
        dto.setId(seat.getId());
        if (seat.getAirplaneModel() != null) {
            dto.setAirplaneModelId(seat.getAirplaneModel().getId());
        }
        dto.setSeatNum(seat.getSeatNum());
        dto.setPosition(seat.getPosition());
        dto.setSeatClass(seat.getSeatClass());
        return dto;
    }
}
