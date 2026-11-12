package fu.se.lms_group6.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import fu.se.lms_group6.dto.questionbank.BatchSaveQuestionsRequest;
import fu.se.lms_group6.dto.questionbank.BulkAssignQuizRequest;
import fu.se.lms_group6.dto.questionbank.BulkDeleteQuestionsRequest;
import fu.se.lms_group6.dto.questionbank.CreateQuestionRequest;
import fu.se.lms_group6.dto.questionbank.GenerateQuestionsAiRequest;
import fu.se.lms_group6.dto.questionbank.GeneratedQuestionItemDto;
import fu.se.lms_group6.dto.questionbank.QuestionBankStatsDto;
import fu.se.lms_group6.dto.questionbank.QuestionResponse;
import fu.se.lms_group6.dto.questionbank.UpdateQuestionRequest;
import fu.se.lms_group6.dto.questionbank.ModuleOptionResponse;
import fu.se.lms_group6.service.QuestionBankService;

@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasRole('TEACHER')")
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    public QuestionBankController(QuestionBankService questionBankService) {
        this.questionBankService = questionBankService;
    }

    @GetMapping("/courses/{courseId}/questions")
    public ResponseEntity<ApiResponse<PageResponse<QuestionResponse>>> getCourseQuestions(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long moduleId,
            @RequestParam(required = false) Boolean assignedOnly,
            @RequestParam(required = false) Boolean unassignedOnly,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword) {
        PageResponse<QuestionResponse> response = questionBankService.getQuestions(
                courseId,
                moduleId,
                assignedOnly,
                unassignedOnly,
                topic,
                difficulty,
                keyword,
                page,
                size,
                sort);
        return ResponseBuilder.ok(response, "Lấy danh sách câu hỏi thành công");
    }

    @GetMapping("/courses/{courseId}/question-bank/stats")
    public ResponseEntity<ApiResponse<QuestionBankStatsDto>> getQuestionBankStats(
            @PathVariable Long courseId) {
        QuestionBankStatsDto stats = questionBankService.getQuestionBankStats(courseId);
        return ResponseBuilder.ok(stats, "Lấy thống kê ngân hàng câu hỏi thành công");
    }

    @GetMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionDetail(
            @PathVariable Long questionId) {
        QuestionResponse response = questionBankService.getQuestionById(questionId);
        return ResponseBuilder.ok(response, "Lấy thông tin chi tiết câu hỏi thành công");
    }

    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request) {
        QuestionResponse response = questionBankService.createQuestion(request);
        return ResponseBuilder.created(response, "Tạo câu hỏi thành công");
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody UpdateQuestionRequest request) {
        QuestionResponse response = questionBankService.updateQuestion(questionId, request);
        return ResponseBuilder.ok(response, "Cập nhật câu hỏi thành công");
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long questionId) {
        questionBankService.deleteQuestion(questionId);
        return ResponseBuilder.noContent();
    }

    @PostMapping("/question-bank/bulk-delete")
    public ResponseEntity<Void> bulkDeleteQuestions(
            @Valid @RequestBody BulkDeleteQuestionsRequest request) {
        questionBankService.bulkDeleteQuestions(request.questionIds());
        return ResponseBuilder.noContent();
    }

    @GetMapping("/courses/{courseId}/question-bank/modules")
    public ResponseEntity<ApiResponse<java.util.List<ModuleOptionResponse>>> getCourseModules(
            @PathVariable Long courseId) {
        return ResponseBuilder.ok(questionBankService.getCourseModules(courseId), "Lấy danh sách module thành công");
    }

    @PostMapping("/question-bank/bulk-assign")
    public ResponseEntity<Void> bulkAssignModule(
            @Valid @RequestBody BulkAssignQuizRequest request) {
        questionBankService.bulkAssignModule(request.questionIds(), request.moduleId());
        return ResponseBuilder.noContent();
    }

    @PostMapping("/question-bank/generate-ai")
    public ResponseEntity<ApiResponse<List<GeneratedQuestionItemDto>>> generateQuestionsAi(
            @Valid @RequestBody GenerateQuestionsAiRequest request) {
        List<GeneratedQuestionItemDto> response = questionBankService.generateQuestionsWithAi(request);
        return ResponseBuilder.ok(response, "Sinh câu hỏi AI thành công");
    }

    @PostMapping("/question-bank/batch-save")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> batchSaveQuestions(
            @Valid @RequestBody BatchSaveQuestionsRequest request) {
        List<QuestionResponse> response = questionBankService.batchSaveQuestions(request);
        return ResponseBuilder.created(response, "Lưu danh sách câu hỏi thành công");
    }
}
