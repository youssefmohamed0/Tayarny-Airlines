package alex.uni.flight_reservation_system.modules.airports;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "countries")
@Data
public class Country {

    // Using the 2-letter country code as the PK instead of a UUID
    @Id
    @Column(name = "country_code", length = 2, nullable = false)
    private String countryCode; 

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Egypt", "United Kingdom"
}
