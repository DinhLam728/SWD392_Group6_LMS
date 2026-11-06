package fu.se.lms_group6.dto.quiz;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubmittedAnswerItem(
        @NotNull(message = "Mã câu hỏi không được để trống")
        Long questionId,
        @Size(max = 10, message = "Đáp án tối đa 10 ký tự")
        String selectedAnswer
) {}
