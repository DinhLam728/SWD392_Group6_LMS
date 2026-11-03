package fu.se.lms_group6.dto.questionbank;

import jakarta.validation.constraints.NotBlank;

public record QuestionOptionDto(
        @NotBlank(message = "Mã phương án không được để trống")
        String key,

        @NotBlank(message = "Nội dung phương án không được để trống")
        String text
) {}
