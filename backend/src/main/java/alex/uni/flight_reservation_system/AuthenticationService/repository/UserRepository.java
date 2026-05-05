package alex.uni.flight_reservation_system.AuthenticationService.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import alex.uni.flight_reservation_system.AuthenticationService.entity.User;

@Repository
public class UserRepository {

    public boolean existsByUsername(String username) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'existsByUsername'");
    }

    public void save(User newUser) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'save'");
    }

    public Optional<User> findByUsername(String username) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findByUsername'");
    }

    public Optional<User> findById(Integer id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }

}
