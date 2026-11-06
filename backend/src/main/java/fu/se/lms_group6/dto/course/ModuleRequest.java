package fu.se.lms_group6.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ModuleRequest(
        @NotBlank(message = "Tên module không được để trống")
        @Size(max = 150, message = "Tên module tối đa 150 ký tự")
        String title
) {}
