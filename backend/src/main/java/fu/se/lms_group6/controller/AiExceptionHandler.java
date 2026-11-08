package fu.se.lms_group6.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import fu.se.lms_group6.common.http.ApiErrorResponse;
import fu.se.lms_group6.externalclient.gemini.AIException;

@RestControllerAdvice(assignableTypes = TeacherCourseController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(AiExceptionHandler.class);

    @ExceptionHandler(AIException.class)
    public ResponseEntity<ApiErrorResponse> aiUnavailable(AIException ex) {
        log.warn("AI request failed: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ApiErrorResponse(
                "AI_SERVICE_UNAVAILABLE",
                "Dịch vụ AI tạm thời không khả dụng, vui lòng thử lại sau",
                List.of()));
    }
}
