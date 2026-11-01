package fu.se.lms_group6.common.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends BusinessException {
    public BadRequestException() {
        this(ErrorCode.INVALID_REQUEST);
    }

    public BadRequestException(ErrorCode errorCode) {
        super(requireStatus(errorCode, HttpStatus.BAD_REQUEST));
    }
}
