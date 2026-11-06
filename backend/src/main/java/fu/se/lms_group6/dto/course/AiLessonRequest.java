package fu.se.lms_group6.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AiLessonRequest(
        @NotNull(message = "Module không được để trống")
        Long moduleId,

        @NotBlank(message = "Tiêu đề bài học không được để trống")
        @Size(max = 150, message = "Tiêu đề bài học tối đa 150 ký tự")
        String title
) {}
