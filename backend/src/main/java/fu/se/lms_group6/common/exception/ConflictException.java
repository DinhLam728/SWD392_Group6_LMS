package fu.se.lms_group6.common.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends BusinessException {
    public ConflictException() {
        this(ErrorCode.CONFLICT);
    }

    public ConflictException(ErrorCode errorCode) {
        super(requireStatus(errorCode, HttpStatus.CONFLICT));
    }
}
