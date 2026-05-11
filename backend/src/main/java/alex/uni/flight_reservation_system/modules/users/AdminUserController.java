package alex.uni.flight_reservation_system.modules.users;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {
    @Autowired
    UserService userService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse(200, "User deleted successfully!", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(400, e.getMessage(), null));
        }
    }
}
