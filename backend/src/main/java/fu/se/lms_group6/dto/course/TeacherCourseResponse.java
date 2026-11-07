package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A course as the owning Teacher sees it. status is DRAFT or PUBLISHED. */
public record TeacherCourseResponse(
        Long courseId,
        String title,
        String description,
        String thumbnailUrl,
        BigDecimal price,
        String status,
        LocalDateTime createdAt
) {}
