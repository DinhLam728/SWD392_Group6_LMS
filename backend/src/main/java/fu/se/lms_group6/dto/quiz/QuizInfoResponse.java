package fu.se.lms_group6.dto.quiz;

import java.math.BigDecimal;
import java.util.List;

public record QuizInfoResponse(
        Long quizId,
        String title,
        Long courseId,
        String courseTitle,
        String moduleTitle,
        Integer questionCount,
        Integer durationMinutes,
        Integer maxAttempts,
        BigDecimal passingScore,
        Integer attemptsUsed,
        Integer remainingAttempts,
        Long inProgressAttemptId,
        Boolean canStart,
        BigDecimal bestScore,
        List<AttemptSummaryResponse> attempts
) {}
