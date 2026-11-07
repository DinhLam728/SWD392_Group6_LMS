package fu.se.lms_group6.dto.course;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Modules and lessons of a course in display order, for the Course Content screen. */
public record CourseContentResponse(
        Long courseId,
        String title,
        String description,
        String thumbnailUrl,
        BigDecimal price,
        String status,
        LocalDateTime createdAt,
        long studentCount,
        long questionCount,
        List<ModuleContent> modules
) {
    // quizCount: practice quizzes of the module; they belong to the module in the schema.
    public record ModuleContent(Long moduleId, String title, Integer position, long quizCount,
            List<LessonItem> lessons) {}

    public record LessonItem(Long lessonId, String title, Integer position, boolean hasContent) {}
}
