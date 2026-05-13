package alex.uni.flight_reservation_system.modules.tickets;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    // Useful if you need to fetch all passengers for a specific booking
    @EntityGraph(attributePaths = {"seat"})
    List<Ticket> findByReservationId(UUID reservationId);
}
