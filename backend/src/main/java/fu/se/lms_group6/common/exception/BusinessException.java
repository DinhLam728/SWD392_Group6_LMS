package fu.se.lms_group6.common.exception;

import java.util.Objects;
import org.springframework.http.HttpStatus;

public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(Objects.requireNonNull(errorCode).message());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() { return errorCode; }

    protected static ErrorCode requireStatus(ErrorCode errorCode, HttpStatus expected) {
        Objects.requireNonNull(errorCode, "errorCode");
        if (errorCode.status() != expected) {
            throw new IllegalArgumentException("Error code must use HTTP " + expected.value());
        }
        return errorCode;
    }
}
