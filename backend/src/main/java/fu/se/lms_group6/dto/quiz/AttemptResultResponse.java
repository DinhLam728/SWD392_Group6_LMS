package fu.se.lms_group6.dto.quiz;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AttemptResultResponse(
        Long attemptId,
        Integer attemptNumber,
        Long quizId,
        String quizTitle,
        Long courseId,
        String courseTitle,
        String status,
        BigDecimal score,
        BigDecimal passingScore,
        Boolean passed,
        Integer correctCount,
        Integer totalQuestions,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        List<ResultQuestionResponse> questions
) {}
