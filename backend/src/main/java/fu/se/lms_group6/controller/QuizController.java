package fu.se.lms_group6.controller;

import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import fu.se.lms_group6.dto.quiz.AiExplanationResponse;
import fu.se.lms_group6.dto.quiz.AttemptResponse;
import fu.se.lms_group6.dto.quiz.AttemptResultResponse;
import fu.se.lms_group6.dto.quiz.CreatePracticeQuizRequest;
import fu.se.lms_group6.dto.quiz.PracticeQuizSetupResponse;
import fu.se.lms_group6.dto.quiz.QuizInfoResponse;
import fu.se.lms_group6.dto.quiz.SubmitAttemptRequest;
import fu.se.lms_group6.security.CurrentStudent;
import fu.se.lms_group6.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Practice quiz của sinh viên: xem quiz, bắt đầu, làm bài, nộp và xem kết quả. */
@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasRole('STUDENT')")
public class QuizController {
    private final QuizService quizzes;
    private final CurrentStudent student;

    public QuizController(QuizService quizzes, CurrentStudent student) {
        this.quizzes = quizzes;
        this.student = student;
    }

    @GetMapping("/modules/{moduleId}/practice-quizzes/setup")
    public ResponseEntity<ApiResponse<PracticeQuizSetupResponse>> practiceQuizSetup(@PathVariable Long moduleId) {
        return ResponseBuilder.ok(quizzes.getPracticeQuizSetup(student.requireId(), moduleId));
    }

    @PostMapping("/modules/{moduleId}/practice-quizzes")
    public ResponseEntity<ApiResponse<QuizInfoResponse>> createPracticeQuiz(@PathVariable Long moduleId,
            @Valid @RequestBody CreatePracticeQuizRequest request) {
        return ResponseBuilder.created(quizzes.createPracticeQuiz(student.requireId(), moduleId, request),
                "Đã tạo quiz ôn tập");
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<QuizInfoResponse>> quizInfo(@PathVariable Long quizId) {
        return ResponseBuilder.ok(quizzes.getQuizInfo(student.requireId(), quizId));
    }

    @PostMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<ApiResponse<AttemptResponse>> start(@PathVariable Long quizId) {
        QuizService.StartResult result = quizzes.startAttempt(student.requireId(), quizId);
        // 201 khi tạo lượt mới, 200 khi tiếp tục lượt đang làm dở.
        return result.created()
                ? ResponseBuilder.created(result.attempt(), "Đã tạo lượt làm bài")
                : ResponseBuilder.ok(result.attempt(), "Tiếp tục lượt làm bài đang dở");
    }

    @GetMapping("/quiz-attempts/{attemptId}")
    public ResponseEntity<ApiResponse<AttemptResponse>> attempt(@PathVariable Long attemptId) {
        return ResponseBuilder.ok(quizzes.getAttempt(student.requireId(), attemptId));
    }

    @PostMapping("/quiz-attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> submit(@PathVariable Long attemptId,
            @Valid @RequestBody SubmitAttemptRequest request) {
        return ResponseBuilder.ok(quizzes.submitAttempt(student.requireId(), attemptId, request), "Nộp bài thành công");
    }

    @GetMapping("/quiz-attempts/{attemptId}/result")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> result(@PathVariable Long attemptId) {
        return ResponseBuilder.ok(quizzes.getResult(student.requireId(), attemptId));
    }

    @PostMapping("/quiz-attempts/{attemptId}/questions/{questionId}/ai-explanation")
    public ResponseEntity<ApiResponse<AiExplanationResponse>> explain(@PathVariable Long attemptId,
            @PathVariable Long questionId) {
        return ResponseBuilder.ok(quizzes.explainQuestion(student.requireId(), attemptId, questionId));
    }
}
