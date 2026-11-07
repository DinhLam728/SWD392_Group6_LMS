package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.AttemptAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    // Thứ tự answer_id chính là thứ tự hiển thị câu hỏi của lượt làm bài.
    @EntityGraph(attributePaths = "question")
    List<AttemptAnswer> findByAttemptAttemptIdOrderByAnswerIdAsc(Long attemptId);
}
