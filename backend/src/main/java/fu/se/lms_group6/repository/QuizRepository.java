package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.Quiz;
import fu.se.lms_group6.entity.enums.QuizStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByModuleCourseCourseIdAndStatusOrderByQuizIdAsc(Long courseId, QuizStatus status);
}
