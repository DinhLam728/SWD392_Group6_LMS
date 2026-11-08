package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.Quiz;
import fu.se.lms_group6.entity.enums.QuizStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByModuleCourseCourseIdAndStatusOrderByQuizIdAsc(Long courseId, QuizStatus status);

    Optional<Quiz> findFirstByModuleModuleIdAndCreatedByIsNullAndStatusOrderByQuizIdAsc(Long moduleId, QuizStatus status);

    List<Quiz> findByModuleModuleIdAndCreatedByUserIdAndStatusOrderByQuizIdDesc(Long moduleId, Long studentId, QuizStatus status);

    @Query(value = "SELECT q.* FROM quizzes q JOIN quiz_configs c ON c.quiz_id = q.quiz_id "
            + "WHERE q.module_id = :moduleId AND q.created_by = :studentId AND q.status = 'ACTIVE' "
            + "AND q.title = :title AND c.question_count = :questionCount AND c.duration_minutes = :durationMinutes "
            + "AND c.max_attempts = :maxAttempts AND c.passing_score = :passingScore "
            + "AND c.random_questions = :randomQuestions AND c.shuffle_questions = :shuffleQuestions "
            + "AND c.shuffle_options = :shuffleOptions "
            + "AND NOT EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.quiz_id = q.quiz_id) "
            + "ORDER BY q.quiz_id DESC LIMIT 1 FOR UPDATE", nativeQuery = true)
    Optional<Quiz> lockUnusedIdenticalPracticeQuiz(@Param("moduleId") Long moduleId, @Param("studentId") Long studentId,
            @Param("title") String title, @Param("questionCount") Integer questionCount,
            @Param("durationMinutes") Integer durationMinutes, @Param("maxAttempts") Integer maxAttempts,
            @Param("passingScore") BigDecimal passingScore, @Param("randomQuestions") boolean randomQuestions,
            @Param("shuffleQuestions") boolean shuffleQuestions, @Param("shuffleOptions") boolean shuffleOptions);
}
