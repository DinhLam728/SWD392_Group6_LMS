package fu.se.lms_group6.dto.questionbank;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateQuestionRequest(
        Long moduleId,

        String topic,

        String difficulty,

        @NotBlank(message = "Nội dung câu hỏi không được để trống")
        String content,

        @NotBlank(message = "Loại câu hỏi không được để trống")
        @Size(max = 30, message = "Loại câu hỏi tối đa 30 ký tự")
        String questionType,

        @Valid
        List<QuestionOptionDto> options,

        @NotBlank(message = "Đáp án đúng không được để trống")
        String correctAnswer,

        String explanation
) {}
