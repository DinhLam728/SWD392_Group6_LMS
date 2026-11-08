package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.AttemptAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    @EntityGraph(attributePaths = "question")
    List<AttemptAnswer> findByAttemptAttemptIdOrderByAnswerIdAsc(Long attemptId);
}
