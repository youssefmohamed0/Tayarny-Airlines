package alex.uni.flight_reservation_system.modules.flights;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightSeatStatusId implements Serializable {
    private UUID flight;
    private UUID seat;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        FlightSeatStatusId that = (FlightSeatStatusId) o;
        return Objects.equals(flight, that.flight) &&
                Objects.equals(seat, that.seat);
    }

    @Override
    public int hashCode() {
        return Objects.hash(flight, seat);
    }
}
