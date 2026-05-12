package alex.uni.flight_reservation_system.modules.fare_options;

import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

import alex.uni.flight_reservation_system.modules.flights.Flight;
import alex.uni.flight_reservation_system.modules.reservations.FlightReservation;

@Entity
@Table(name = "fare_options")
@Data
public class FareOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(name = "fare_name", nullable = false, length = 100)
    private String fareName;

    @Column(name = "cabin_class", nullable = false, length = 50)
    private String cabinClass;

    @Column(name = "price_per_adult", nullable = false)
    private Double pricePerAdult;

    @Column(name = "price_per_child", nullable = false)
    private Double pricePerChild;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "benefits", columnDefinition = "text[]")
    private List<String> benefits;

    @OneToMany(mappedBy = "fareOption", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlightReservation> reservations;
}
