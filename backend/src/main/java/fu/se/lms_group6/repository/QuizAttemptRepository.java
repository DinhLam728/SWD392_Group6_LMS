package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.QuizAttempt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizQuizIdAndStudentUserIdOrderByAttemptIdAsc(Long quizId, Long studentId);

    Optional<QuizAttempt> findByAttemptIdAndStudentUserId(Long attemptId, Long studentId);

    // Đọc có khóa để luôn thấy dữ liệu mới nhất khi bắt đầu lượt làm song song.
    @Query(value = "SELECT * FROM quiz_attempts WHERE quiz_id = :quizId AND student_id = :studentId "
            + "ORDER BY attempt_id FOR UPDATE", nativeQuery = true)
    List<QuizAttempt> lockByQuizAndStudent(@Param("quizId") Long quizId, @Param("studentId") Long studentId);

    // Khóa lượt làm bài trước khi nộp để chặn nộp hai lần cùng lúc.
    @Query(value = "SELECT * FROM quiz_attempts WHERE attempt_id = :attemptId AND student_id = :studentId "
            + "FOR UPDATE", nativeQuery = true)
    Optional<QuizAttempt> lockByIdAndStudent(@Param("attemptId") Long attemptId, @Param("studentId") Long studentId);
}
