package alex.uni.flight_reservation_system.modules.users.AdminControllers;

import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;
import alex.uni.flight_reservation_system.modules.users.AdminUserController;
import alex.uni.flight_reservation_system.modules.users.UserService;
import alex.uni.flight_reservation_system.modules.users.dto.AdminUsersResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

class AdminUserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminUserController adminUserController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllUsers_Success() {
        AdminUsersResponse mockResponse = AdminUsersResponse.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .role("CUSTOMER")
                .build();
        when(userService.getAllUsers()).thenReturn(Collections.singletonList(mockResponse));

        ResponseEntity<?> response = adminUserController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> body = (List<?>) response.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
    }

    @Test
    void testGetAllUsers_Exception() {
        when(userService.getAllUsers()).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<?> response = adminUserController.getAllUsers();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals(400, apiResponse.getStatusCode());
        assertEquals("Database error", apiResponse.getMessage());
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        UUID testId = UUID.randomUUID();
        doNothing().when(userService).deleteUser(testId);

        ResponseEntity<?> response = adminUserController.deleteUser(testId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals(200, apiResponse.getStatusCode());
        assertEquals("User deleted successfully!", apiResponse.getMessage());
    }

    @Test
    void testDeleteUser_Exception() throws Exception {
        UUID testId = UUID.randomUUID();
        doThrow(new RuntimeException("User not found")).when(userService).deleteUser(testId);

        ResponseEntity<?> response = adminUserController.deleteUser(testId);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiResponse apiResponse = (ApiResponse) response.getBody();
        assertNotNull(apiResponse);
        assertEquals(400, apiResponse.getStatusCode());
        assertEquals("User not found", apiResponse.getMessage());
    }
}
