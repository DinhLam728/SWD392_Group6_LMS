package fu.se.lms_group6.dto.questionbank;

import java.util.List;
import jakarta.validation.constraints.NotEmpty;

public record BulkAssignQuizRequest(
        @NotEmpty(message = "Danh sách câu hỏi không được để trống")
        List<Long> questionIds,

        Long quizId
) {}

