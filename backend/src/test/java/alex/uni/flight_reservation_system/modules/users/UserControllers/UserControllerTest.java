package alex.uni.flight_reservation_system.modules.users.UserControllers;

import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;
import alex.uni.flight_reservation_system.modules.users.UserController;
import alex.uni.flight_reservation_system.modules.users.UserService;
import alex.uni.flight_reservation_system.modules.users.dto.UserResponse;
import alex.uni.flight_reservation_system.modules.users.dto.UserUpdateRequest;
import alex.uni.flight_reservation_system.modules.users.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetUserProfile_Success() throws Exception {
        UserResponse mockResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .fullName("Test User")
                .build();
        when(userService.getUserProfile()).thenReturn(mockResponse);

        ResponseEntity<?> response = userController.getUserProfile();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testGetUserProfile_NotFound() throws Exception {
        when(userService.getUserProfile()).thenThrow(new ResourceNotFoundException("User not found"));

        ResponseEntity<?> response = userController.getUserProfile();

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals("User not found", apiResponse.getMessage());
    }

    @Test
    void testUpdateProfile_Success() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        UserResponse mockResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .fullName("Updated User")
                .build();
        when(userService.updateProfile(request)).thenReturn(mockResponse);

        ResponseEntity<?> response = userController.updateProfile(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testUpdateProfile_NotFound() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        when(userService.updateProfile(request)).thenThrow(new ResourceNotFoundException("User not found"));

        ResponseEntity<?> response = userController.updateProfile(request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals("User not found", apiResponse.getMessage());
    }

    @Test
    void testDeleteProfile_Success() throws Exception {
        doNothing().when(userService).deleteProfile();

        ResponseEntity<?> response = userController.deleteProfile();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals("Profile deleted successfully", apiResponse.getMessage());
    }

    @Test
    void testDeleteProfile_NotFound() throws Exception {
        doThrow(new ResourceNotFoundException("User not found")).when(userService).deleteProfile();

        ResponseEntity<?> response = userController.deleteProfile();

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals("User not found", apiResponse.getMessage());
    }
}
