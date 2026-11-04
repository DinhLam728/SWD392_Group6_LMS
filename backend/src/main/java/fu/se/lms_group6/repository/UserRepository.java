package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);

    @Query(value = "SELECT * FROM users WHERE user_id = :id FOR UPDATE", nativeQuery = true)
    Optional<User> findByIdForUpdate(@Param("id") Long id);
}
