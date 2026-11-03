package fu.se.lms_group6.dto.questionbank;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GenerateQuestionsAiRequest(
        @NotNull(message = "Mã khóa học không được để trống")
        Long courseId,

        @NotBlank(message = "Chủ đề câu hỏi không được để trống")
        @Size(max = 250, message = "Chủ đề tối đa 250 ký tự")
        String topic,

        String contextMaterial,

        @Min(value = 1, message = "Số lượng câu hỏi tối thiểu là 1")
        @Max(value = 20, message = "Số lượng câu hỏi tối đa là 20")
        Integer numberOfQuestions,

        String difficultyLevel
) {}
