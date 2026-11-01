package fu.se.lms_group6.common.http;

import java.util.List;
import fu.se.lms_group6.common.exception.ErrorCode;

public record ApiErrorResponse(String code, String message, List<FieldViolation> errors) {
    public ApiErrorResponse {
        errors = errors == null ? List.of() : List.copyOf(errors);
    }

    public static ApiErrorResponse of(ErrorCode error) {
        return new ApiErrorResponse(error.name(), error.message(), List.of());
    }
}
