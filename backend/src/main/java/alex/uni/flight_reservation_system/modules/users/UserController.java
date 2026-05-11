package alex.uni.flight_reservation_system.modules.users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import alex.uni.flight_reservation_system.modules.auth.dto.ApiResponse;
import alex.uni.flight_reservation_system.modules.users.dto.UserUpdateRequest;
import alex.uni.flight_reservation_system.modules.users.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    UserService userService;

    @GetMapping("")
    public ResponseEntity<?> getUserProfile() {
        try {
            return ResponseEntity.ok(userService.getUserProfile());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.builder()
                    .message("User not found")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.builder()
                    .message("Internal server error")
                    .build());
        }
    }

    @PutMapping("")
    public ResponseEntity<?> updateProfile(@RequestBody UserUpdateRequest reqeust) {
        try {
            return ResponseEntity.ok(userService.updateProfile(reqeust));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.builder()
                    .message("User not found")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.builder()
                    .message("Internal server error")
                    .build());
        }
    }

}
