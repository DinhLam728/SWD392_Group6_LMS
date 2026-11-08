package fu.se.lms_group6.dto.quiz;

import java.util.List;

public record AttemptQuestionResponse(
        Long questionId,
        Integer order,
        String content,
        List<QuizOptionResponse> options
) {}
