package fu.se.lms_group6.service;

import fu.se.lms_group6.dto.quiz.AiExplanationResponse;
import fu.se.lms_group6.dto.quiz.AttemptResponse;
import fu.se.lms_group6.dto.quiz.AttemptResultResponse;
import fu.se.lms_group6.dto.quiz.CreatePracticeQuizRequest;
import fu.se.lms_group6.dto.quiz.PracticeQuizSetupResponse;
import fu.se.lms_group6.dto.quiz.QuizInfoResponse;
import fu.se.lms_group6.dto.quiz.SubmitAttemptRequest;

public interface QuizService {
    PracticeQuizSetupResponse getPracticeQuizSetup(Long studentId, Long moduleId);

    QuizInfoResponse createPracticeQuiz(Long studentId, Long moduleId, CreatePracticeQuizRequest request);

    QuizInfoResponse getQuizInfo(Long studentId, Long quizId);

    StartResult startAttempt(Long studentId, Long quizId);

    AttemptResponse getAttempt(Long studentId, Long attemptId);

    AttemptResultResponse submitAttempt(Long studentId, Long attemptId, SubmitAttemptRequest request);

    AttemptResultResponse getResult(Long studentId, Long attemptId);

    AiExplanationResponse explainQuestion(Long studentId, Long attemptId, Long questionId);

    record StartResult(AttemptResponse attempt, boolean created) {}
}
