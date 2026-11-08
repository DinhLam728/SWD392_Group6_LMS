package fu.se.lms_group6.dto.quiz;

import java.util.List;

public record PracticeQuizSetupResponse(
        Long moduleId,
        String moduleTitle,
        Long courseId,
        String courseTitle,
        int availableQuestions,
        List<QuizInfoResponse> myQuizzes
) {}
