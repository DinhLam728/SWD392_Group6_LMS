package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.Question;
import fu.se.lms_group6.entity.enums.QuizStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("""
        SELECT q FROM Question q
        LEFT JOIN q.quiz qz
        WHERE q.course.courseId = :courseId
          AND (:moduleId IS NULL OR (qz IS NOT NULL AND qz.module.moduleId = :moduleId))
          AND (:assignedOnly = FALSE OR qz IS NOT NULL)
          AND (:unassignedOnly = FALSE OR qz IS NULL)
          AND (:topic IS NULL OR :topic = '' OR :topic = 'ALL' OR LOWER(q.optionsJson) LIKE LOWER(CONCAT('%', :topic, '%')))
          AND (:difficulty IS NULL OR :difficulty = '' OR :difficulty = 'ALL' OR LOWER(q.optionsJson) LIKE LOWER(CONCAT('%"difficulty":"', :difficulty, '"%')) OR LOWER(q.optionsJson) LIKE LOWER(CONCAT('%', :difficulty, '%')))
          AND (:keyword IS NULL OR :keyword = '' OR LOWER(q.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Question> searchQuestions(
            @Param("courseId") Long courseId,
            @Param("moduleId") Long moduleId,
            @Param("assignedOnly") boolean assignedOnly,
            @Param("unassignedOnly") boolean unassignedOnly,
            @Param("topic") String topic,
            @Param("difficulty") String difficulty,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByCourse_CourseId(Long courseId);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.course.courseId = :courseId AND (LOWER(q.optionsJson) LIKE LOWER(CONCAT('%\"difficulty\":\"', :difficulty, '\"%')) OR LOWER(q.optionsJson) LIKE LOWER(CONCAT('%\"', :difficulty, '\"%')))")
    long countByCourseIdAndDifficulty(
            @Param("courseId") Long courseId,
            @Param("difficulty") String difficulty
    );

    long countByCourse_CourseIdAndQuizIsNotNull(Long courseId);

    long countByCourse_CourseIdAndQuizIsNull(Long courseId);

    List<Question> findByQuizQuizIdOrderByQuestionIdAsc(Long quizId);

    List<Question> findByQuizModuleModuleIdAndQuizCreatedByIsNullAndQuizStatusOrderByQuestionIdAsc(
            Long moduleId, QuizStatus status);
}
