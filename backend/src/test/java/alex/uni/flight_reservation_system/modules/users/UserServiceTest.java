package alex.uni.flight_reservation_system.modules.users;

import alex.uni.flight_reservation_system.common.enums.Role;
import alex.uni.flight_reservation_system.modules.users.dto.AdminUsersResponse;
import alex.uni.flight_reservation_system.modules.users.dto.UserResponse;
import alex.uni.flight_reservation_system.modules.users.dto.UserUpdateRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testuser");

        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        testUser.setFullName("Test User");
        testUser.setEmail("test@test.com");
        testUser.setRole(Role.CUSTOMER);
        testUser.setReservations(new ArrayList<>());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetUserProfile_Success() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserResponse response = userService.getUserProfile();

        assertNotNull(response);
        assertEquals(testUserId, response.getId());
        assertEquals("testuser", response.getUsername());
        assertEquals("Test User", response.getFullName());
        assertEquals(0, response.getTotalFlights());
    }

    @Test
    void testGetUserProfile_UserNotFound() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exception.class, () -> userService.getUserProfile());
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    void testUpdateProfile_Success() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setFullName("Updated Name");
        request.setEmail("updated@test.com");
        request.setPassword("newPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        UserResponse response = userService.updateProfile(request);

        assertNotNull(response);
        assertEquals("Updated Name", response.getFullName());
        assertEquals("updated@test.com", response.getEmail());

        verify(userRepository).save(testUser);
        assertEquals("encodedNewPassword", testUser.getPassword());
    }

    @Test
    void testGetAllUsers() {
        List<User> users = new ArrayList<>();
        users.add(testUser);
        when(userRepository.findAll()).thenReturn(users);

        List<AdminUsersResponse> responseList = userService.getAllUsers();

        assertEquals(1, responseList.size());
        assertEquals(testUserId, responseList.get(0).getId());
        assertEquals("testuser", responseList.get(0).getUsername());
        assertEquals("CUSTOMER", responseList.get(0).getRole());
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        doNothing().when(userRepository).deleteById(testUserId);

        userService.deleteUser(testUserId);

        verify(userRepository).deleteById(testUserId);
    }

    @Test
    void testDeleteProfile_Success() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        userService.deleteProfile();

        verify(userRepository).delete(testUser);
    }
}
