package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;

public record CourseSummaryResponse(
        Long courseId,
        String title,
        String description,
        String thumbnailUrl,
        BigDecimal price,
        String teacherName
) {}
