package fu.se.lms_group6.dto.quiz;

import java.util.List;

public record ResultQuestionResponse(
        Long questionId,
        Integer order,
        String content,
        List<QuizOptionResponse> options,
        String selectedAnswer,
        String correctAnswer,
        Boolean correct,
        String explanation
) {}
