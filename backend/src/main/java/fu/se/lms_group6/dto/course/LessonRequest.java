package fu.se.lms_group6.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LessonRequest(
        @NotBlank(message = "Tiêu đề bài học không được để trống")
        @Size(max = 150, message = "Tiêu đề bài học tối đa 150 ký tự")
        String title,

        // lessons.content is TEXT (65,535 bytes); 16000 characters stay below it even at 4 bytes each.
        @NotBlank(message = "Nội dung bài học không được để trống")
        @Size(max = 16000, message = "Nội dung bài học tối đa 16000 ký tự")
        String content
) {}
