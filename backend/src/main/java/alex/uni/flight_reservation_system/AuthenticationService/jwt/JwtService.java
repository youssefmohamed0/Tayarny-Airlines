package alex.uni.flight_reservation_system.AuthenticationService.jwt;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;
    @Value("${app.jwt.access-token-expiration-ms}")
    private Long tokenExpirationMs;

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        extraClaims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        return Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + tokenExpirationMs))
            .signWith(getKey())
            .compact();
    }

    public String extractUsername(String jwt) {
        return extractClaim(jwt, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class)); // "role: ROLE_USER" or "role: ROLE_ADMIN" or ...
    }

    public boolean isTokenValid(String jwt, UserDetails userDetails) {
        final String username = extractUsername(jwt);
        final String roleString = extractRole(jwt);
        try {
            if (username.equals(userDetails.getUsername())
                && (roleString.equals(userDetails.getAuthorities().iterator().next().getAuthority())
                && !isTokenExpired(jwt))) {
                return true;
            }
        } catch (SecurityException ex) {
            System.err.println("Invalid JWT signature");
            } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token");
            } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token");
            } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token");
            } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty");
            }

        return false;
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResoulver) {
        return claimsResoulver.apply(extractAllClaims(token));
    }

    public Claims extractAllClaims(String token) { // throws unchecked exceptions
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
}
