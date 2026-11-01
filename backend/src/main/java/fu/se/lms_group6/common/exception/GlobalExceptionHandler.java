package fu.se.lms_group6.common.exception;

import java.util.List;
import jakarta.validation.ConstraintViolationException;
import fu.se.lms_group6.common.http.ApiErrorResponse;
import fu.se.lms_group6.common.http.FieldViolation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Object> business(BusinessException ex) {
        return error(ex.getErrorCode());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> validation(ConstraintViolationException ex) {
        List<FieldViolation> errors = ex.getConstraintViolations().stream()
                .map(v -> new FieldViolation(v.getPropertyPath().toString(), v.getMessage()))
                .toList();
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                ErrorCode.VALIDATION_ERROR.name(), ErrorCode.VALIDATION_ERROR.message(), errors));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> forbidden(AccessDeniedException ex) {
        return error(ErrorCode.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> unauthorized(AuthenticationException ex) {
        return error(ErrorCode.UNAUTHORIZED);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        ErrorCode code = switch (status.value()) {
            case 401 -> ErrorCode.UNAUTHORIZED;
            case 403 -> ErrorCode.FORBIDDEN;
            case 404 -> ErrorCode.NOT_FOUND;
            case 405 -> ErrorCode.METHOD_NOT_ALLOWED;
            case 406 -> ErrorCode.NOT_ACCEPTABLE;
            case 415 -> ErrorCode.UNSUPPORTED_MEDIA_TYPE;
            default -> status.is5xxServerError() ? ErrorCode.INTERNAL_ERROR : ErrorCode.INVALID_REQUEST;
        };
        List<FieldViolation> errors = List.of();
        if (ex instanceof MethodArgumentNotValidException validation) {
            code = ErrorCode.VALIDATION_ERROR;
            errors = validation.getBindingResult().getAllErrors().stream()
                    .map(e -> new FieldViolation(
                            e instanceof org.springframework.validation.FieldError field
                                    ? field.getField() : "_global",
                            e.getDefaultMessage()))
                    .toList();
        } else if (ex instanceof HandlerMethodValidationException validation && !status.is5xxServerError()) {
            code = ErrorCode.VALIDATION_ERROR;
            errors = validation.getParameterValidationResults().stream()
                    .flatMap(result -> result.getResolvableErrors().stream().map(e ->
                            new FieldViolation(result.getMethodParameter().getParameterName() == null
                                    ? "_request" : result.getMethodParameter().getParameterName(),
                                    e.getDefaultMessage())))
                    .toList();
        }
        if (status.is5xxServerError()) log.error("Unhandled MVC failure", ex);
        return new ResponseEntity<>(new ApiErrorResponse(code.name(), code.message(), errors), headers, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> unexpected(Exception ex) {
        log.error("Unhandled API failure", ex);
        return error(ErrorCode.INTERNAL_ERROR);
    }

    private ResponseEntity<Object> error(ErrorCode code) {
        return ResponseEntity.status(code.status()).body(ApiErrorResponse.of(code));
    }
}
