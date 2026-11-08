package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TeacherCourseResponse(
        Long courseId,
        String title,
        String description,
        String thumbnailUrl,
        BigDecimal price,
        String status,
        LocalDateTime createdAt
) {}
