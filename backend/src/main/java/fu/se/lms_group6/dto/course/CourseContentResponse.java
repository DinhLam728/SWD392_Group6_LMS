package fu.se.lms_group6.dto.course;

import java.util.List;

/** Modules and lessons of a course in display order, for the Course Content screen. */
public record CourseContentResponse(
        Long courseId,
        String title,
        String status,
        List<ModuleContent> modules
) {
    public record ModuleContent(Long moduleId, String title, Integer position, List<LessonItem> lessons) {}

    public record LessonItem(Long lessonId, String title, Integer position, boolean hasContent) {}
}
