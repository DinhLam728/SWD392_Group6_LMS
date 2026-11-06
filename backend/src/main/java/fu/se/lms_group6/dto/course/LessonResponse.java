package fu.se.lms_group6.dto.course;

/** A lesson with its body, for the Lesson form. courseId and moduleTitle give the form its context. */
public record LessonResponse(
        Long lessonId,
        Long moduleId,
        Long courseId,
        String moduleTitle,
        String title,
        String content,
        Integer position
) {}
