package alex.uni.flight_reservation_system.modules.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-auth")
public class TestAuthController {

    @GetMapping
    public ResponseEntity<String> testAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }
        
        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("UNKNOWN_ROLE");
                
        // If the role starts with "ROLE_", you might want to strip it depending on your preference
        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }
        
        return ResponseEntity.ok("hello " + username + " " + role);
    }
}
