package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;

/** One row of the My Courses list. */
public record TeacherCourseSummaryResponse(
        Long courseId,
        String title,
        String thumbnailUrl,
        BigDecimal price,
        String status,
        long moduleCount,
        long lessonCount
) {}
