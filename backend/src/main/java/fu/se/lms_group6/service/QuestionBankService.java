package fu.se.lms_group6.service;

import java.util.List;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.questionbank.BatchSaveQuestionsRequest;
import fu.se.lms_group6.dto.questionbank.CreateQuestionRequest;
import fu.se.lms_group6.dto.questionbank.GenerateQuestionsAiRequest;
import fu.se.lms_group6.dto.questionbank.GeneratedQuestionItemDto;
import fu.se.lms_group6.dto.questionbank.QuestionBankStatsDto;
import fu.se.lms_group6.dto.questionbank.QuestionResponse;
import fu.se.lms_group6.dto.questionbank.UpdateQuestionRequest;

public interface QuestionBankService {

    PageResponse<QuestionResponse> getQuestions(
            Long courseId,
            Long quizId,
            Boolean unassignedOnly,
            String topic,
            String difficulty,
            String keyword,
            int page,
            int size,
            String sort
    );

    QuestionBankStatsDto getQuestionBankStats(Long courseId);

    QuestionResponse getQuestionById(Long questionId);

    QuestionResponse createQuestion(CreateQuestionRequest request);

    QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request);

    void deleteQuestion(Long questionId);

    List<GeneratedQuestionItemDto> generateQuestionsWithAi(GenerateQuestionsAiRequest request);

    List<QuestionResponse> batchSaveQuestions(BatchSaveQuestionsRequest request);
}
