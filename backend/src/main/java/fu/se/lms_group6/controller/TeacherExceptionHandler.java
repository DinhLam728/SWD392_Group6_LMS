package fu.se.lms_group6.controller;

import java.util.List;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import fu.se.lms_group6.common.http.ApiErrorResponse;
import fu.se.lms_group6.service.TeacherConflictException;

/**
 * Conflicts with an explanation. ErrorCode.CONFLICT has a fixed text and common/** belongs to the
 * whole team, so this handler is limited to TeacherCourseController, like AiExceptionHandler.
 */
@RestControllerAdvice(assignableTypes = TeacherCourseController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TeacherExceptionHandler {

    @ExceptionHandler(TeacherConflictException.class)
    public ResponseEntity<ApiErrorResponse> conflict(TeacherConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorResponse("CONFLICT", ex.getMessage(), List.of()));
    }
}
