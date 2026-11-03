package fu.se.lms_group6.dto.questionbank;

import java.util.List;

public record GeneratedQuestionItemDto(
        String content,
        String questionType,
        List<QuestionOptionDto> options,
        String correctAnswer,
        String explanation
) {}
