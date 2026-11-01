package fu.se.lms_group6.common.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends BusinessException {
    public NotFoundException() {
        this(ErrorCode.NOT_FOUND);
    }

    public NotFoundException(ErrorCode errorCode) {
        super(requireStatus(errorCode, HttpStatus.NOT_FOUND));
    }
}
