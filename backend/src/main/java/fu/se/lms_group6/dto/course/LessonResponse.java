package fu.se.lms_group6.dto.course;

public record LessonResponse(
        Long lessonId,
        Long moduleId,
        Long courseId,
        String moduleTitle,
        String title,
        String content,
        Integer position
) {}
