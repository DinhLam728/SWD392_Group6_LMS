package fu.se.lms_group6.dto.quiz;

import java.util.List;

// Câu hỏi khi đang làm bài: không bao giờ chứa đáp án đúng hay giải thích.
public record AttemptQuestionResponse(
        Long questionId,
        Integer order,
        String content,
        List<QuizOptionResponse> options
) {}
