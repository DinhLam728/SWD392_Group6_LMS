package fu.se.lms_group6.dto.quiz;

import java.time.LocalDateTime;
import java.util.List;

public record AttemptResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Long courseId,
        String courseTitle,
        String status,
        Integer durationMinutes,
        LocalDateTime startedAt,
        LocalDateTime deadline,
        LocalDateTime serverTime,
        List<AttemptQuestionResponse> questions
) {}
