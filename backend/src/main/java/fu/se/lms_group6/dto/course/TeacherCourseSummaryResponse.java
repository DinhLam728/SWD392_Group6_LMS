package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TeacherCourseSummaryResponse(
        Long courseId,
        String title,
        String thumbnailUrl,
        BigDecimal price,
        String status,
        long moduleCount,
        long lessonCount,
        LocalDateTime createdAt,
        long studentCount
) {}
