package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.QuizConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizConfigRepository extends JpaRepository<QuizConfig, Long> {
    Optional<QuizConfig> findByQuizQuizId(Long quizId);
}
