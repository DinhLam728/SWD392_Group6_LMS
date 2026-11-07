package fu.se.lms_group6.dto.quiz;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AttemptSummaryResponse(
        Long attemptId,
        Integer attemptNumber,
        String status,
        BigDecimal score,
        Boolean passed,
        LocalDateTime startedAt,
        LocalDateTime submittedAt
) {}
