package fu.se.lms_group6.dto.questionbank;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BatchSaveQuestionsRequest(
        @NotNull(message = "Mã khóa học không được để trống")
        Long courseId,

        Long moduleId,

        @NotEmpty(message = "Danh sách câu hỏi không được rỗng")
        @Valid
        List<CreateQuestionRequest> questions
) {}
