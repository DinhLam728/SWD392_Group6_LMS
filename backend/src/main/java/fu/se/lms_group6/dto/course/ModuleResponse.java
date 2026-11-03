package fu.se.lms_group6.dto.course;

import java.util.List;

public record ModuleResponse(
        Long moduleId,
        String title,
        Integer position,
        List<LessonSummaryResponse> lessons,
        List<QuizSummaryResponse> quizzes
) {}
