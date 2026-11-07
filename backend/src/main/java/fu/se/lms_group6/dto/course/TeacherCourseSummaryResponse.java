package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** One row of the My Courses list. studentCount counts ACTIVE registrations. */
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
