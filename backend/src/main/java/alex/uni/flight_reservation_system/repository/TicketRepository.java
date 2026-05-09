package alex.uni.flight_reservation_system.repository;

import com.yourdomain.flightbooking.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    // Useful if you need to fetch all passengers for a specific booking
    List<Ticket> findByReservationId(UUID reservationId);
}