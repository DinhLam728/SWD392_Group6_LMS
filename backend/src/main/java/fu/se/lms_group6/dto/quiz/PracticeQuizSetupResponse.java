package fu.se.lms_group6.dto.quiz;

import java.util.List;

/** Thông tin hiển thị trên trang quiz ôn tập: module nào, có bao nhiêu câu hỏi để chọn và các quiz sinh viên đã tạo. */
public record PracticeQuizSetupResponse(
        Long moduleId,
        String moduleTitle,
        Long courseId,
        String courseTitle,
        int availableQuestions,
        List<QuizInfoResponse> myQuizzes
) {}
