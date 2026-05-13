package alex.uni.flight_reservation_system.integration;

import alex.uni.flight_reservation_system.modules.auth.dto.AuthenticationResponse;
import alex.uni.flight_reservation_system.modules.auth.dto.LoginRequest;
import alex.uni.flight_reservation_system.modules.auth.dto.SignupRequest;
import alex.uni.flight_reservation_system.modules.flights.dto.AdminFlightRequest;
import alex.uni.flight_reservation_system.modules.reservations.dto.CheckoutRequest;
import alex.uni.flight_reservation_system.modules.reservations.dto.TravelerInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.*;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class FlightBookingIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    /**
     * Login with Flyway-seeded admin credentials from TEST_CREDENTIALS.md
     */
    private String getAdminToken() {
        LoginRequest loginRequest = new LoginRequest("admin", "Admin@123");
        ResponseEntity<AuthenticationResponse> response = restTemplate.postForEntity(
                "/api/auth/login", loginRequest, AuthenticationResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode(), "Admin login failed");
        return response.getBody().getAccessToken();
    }

    /**
     * Signup a fresh customer for the test (unique username to avoid conflicts)
     */
    private String signupCustomerAndGetToken() {
        SignupRequest signup = new SignupRequest();
        signup.setUsername("booking_customer");
        signup.setPassword("Customer@123");
        signup.setEmail("booking_customer@test.com");
        signup.setFullName("Booking Customer");
        restTemplate.postForEntity("/api/auth/signup", signup, String.class);

        LoginRequest login = new LoginRequest("booking_customer", "Customer@123");
        ResponseEntity<AuthenticationResponse> resp = restTemplate.postForEntity(
                "/api/auth/login", login, AuthenticationResponse.class);
        assertEquals(HttpStatus.OK, resp.getStatusCode(), "Customer login failed");
        return resp.getBody().getAccessToken();
    }

    @Test
    void testEndToEndBookingFlow() {
        // 1. Login as seeded admin, signup a customer
        String adminToken = getAdminToken();
        String userToken = signupCustomerAndGetToken();

        // 2. Admin schedules a flight
        //    - Airport codes CAI, DXB seeded in V3
        //    - Aircraft "Airbus A320neo" seeded in V3
        //    - Seat "3A" exists for this model in V3
        AdminFlightRequest flightRequest = new AdminFlightRequest();
        flightRequest.setFlightNumber("IT-101");
        flightRequest.setAircraft("Airbus A320neo");

        AdminFlightRequest.DepartureDto dep = new AdminFlightRequest.DepartureDto();
        dep.setAirport("CAI");
        dep.setTime(LocalDateTime.now().plusDays(10));
        dep.setTerminal("T3");
        flightRequest.setDeparture(dep);

        AdminFlightRequest.ArrivalDto arr = new AdminFlightRequest.ArrivalDto();
        arr.setAirport("DXB");
        arr.setTime(LocalDateTime.now().plusDays(10).plusHours(3));
        flightRequest.setArrival(arr);

        AdminFlightRequest.AdminFareOptionDto fare = new AdminFlightRequest.AdminFareOptionDto();
        fare.setFareName("Economy Standard");
        fare.setPricePerSeat(200.0);
        fare.setAvailableSeats(50);
        flightRequest.setFareOptions(Collections.singletonList(fare));

        HttpHeaders adminHeaders = new HttpHeaders();
        adminHeaders.setBearerAuth(adminToken);
        HttpEntity<AdminFlightRequest> adminEntity = new HttpEntity<>(flightRequest, adminHeaders);

        ResponseEntity<String> flightResponse = restTemplate.postForEntity(
                "/api/admin/flight", adminEntity, String.class);

        assertEquals(HttpStatus.OK, flightResponse.getStatusCode(),
                "Flight creation failed: " + flightResponse.getBody());

        // 3. Customer books a ticket
        //    fareClass = "Economy Standard" matches the cabin_class set by FlightService
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setFlightNumber("IT-101");
        checkoutRequest.setFareClass("Economy Standard");
        checkoutRequest.setCreditCardNumber("1234567812345678");
        checkoutRequest.setCardExpiryDate("12/2030");

        TravelerInfo traveler = new TravelerInfo();
        traveler.setFullName("Integration Test User");
        traveler.setPassportNumber("A1234567");
        traveler.setType("ADULT");
        traveler.setAssignedSeat("3A");
        checkoutRequest.setTravelers(Collections.singletonList(traveler));

        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(userToken);
        HttpEntity<CheckoutRequest> userEntity = new HttpEntity<>(checkoutRequest, userHeaders);

        ResponseEntity<String> checkoutResponse = restTemplate.postForEntity(
                "/api/checkout", userEntity, String.class);

        assertEquals(HttpStatus.OK, checkoutResponse.getStatusCode(),
                "Checkout failed: " + checkoutResponse.getBody());

        assertNotNull(checkoutResponse.getBody());
        assertTrue(checkoutResponse.getBody().contains("CONFIRMED"),
                "Expected CONFIRMED in response: " + checkoutResponse.getBody());
    }
}
