package fu.se.lms_group6.dto.questionbank;

import java.util.List;

public record QuestionResponse(
        Long questionId,
        Long courseId,
        String courseTitle,
        Long quizId,
        String quizTitle,
        String topic,
        String difficulty,
        String content,
        String questionType,
        List<QuestionOptionDto> options,
        String correctAnswer,
        String explanation
) {}
