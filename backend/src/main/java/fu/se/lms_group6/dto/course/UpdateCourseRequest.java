package fu.se.lms_group6.dto.course;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateCourseRequest(
        @NotBlank(message = "Tên khóa học không được để trống")
        @Size(max = 150, message = "Tên khóa học tối đa 150 ký tự")
        String title,

        @NotBlank(message = "Mô tả không được để trống")
        @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
        String description,

        @NotNull(message = "Giá không được để trống")
        // lms_g6_v4.sql has CHECK (price > 0), so a price of 0 would be rejected by the database.
        @Positive(message = "Giá phải lớn hơn 0")
        @Max(value = 9_999_999_999L, message = "Giá vượt quá giới hạn cho phép")
        Long price,

        @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
        String thumbnailUrl
) {}
