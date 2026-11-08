package fu.se.lms_group6.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Vui lòng xác thực để tiếp tục"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên"),
    CONFLICT(HttpStatus.CONFLICT, "Dữ liệu xung đột với trạng thái hiện tại"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Phương thức HTTP không được hỗ trợ"),
    NOT_ACCEPTABLE(HttpStatus.NOT_ACCEPTABLE, "Định dạng phản hồi không được hỗ trợ"),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Content-Type không được hỗ trợ"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email đã được sử dụng"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác"),
    ACCOUNT_LOCKED(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa"),
    ACCOUNT_NOT_ACTIVATED(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt"),
    INVALID_OTP(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác hoặc đã hết hạn"),
    ACCOUNT_ALREADY_ACTIVATED(HttpStatus.BAD_REQUEST, "Tài khoản đã được kích hoạt trước đó"),

    QUIZ_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy bài quiz"),
    QUIZ_NOT_AVAILABLE(HttpStatus.CONFLICT, "Bài quiz hiện chưa được mở"),
    QUIZ_HAS_NO_QUESTIONS(HttpStatus.CONFLICT, "Bài quiz chưa có câu hỏi"),
    NOT_ENROLLED(HttpStatus.FORBIDDEN, "Bạn cần đăng ký khóa học trước khi làm bài quiz"),
    LESSON_NOT_ENROLLED(HttpStatus.FORBIDDEN, "Bạn cần đăng ký khóa học trước khi học bài này"),
    MAX_ATTEMPTS_REACHED(HttpStatus.CONFLICT, "Bạn đã dùng hết số lượt làm bài quiz này"),
    ATTEMPT_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy lượt làm bài"),
    ATTEMPT_ALREADY_SUBMITTED(HttpStatus.CONFLICT, "Lượt làm bài đã được nộp"),
    ATTEMPT_EXPIRED(HttpStatus.CONFLICT, "Đã hết thời gian làm bài"),
    ATTEMPT_NOT_GRADED(HttpStatus.CONFLICT, "Lượt làm bài chưa được chấm điểm"),
    AI_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "Dịch vụ AI tạm thời không khả dụng, vui lòng thử lại sau");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus status() { return status; }
    public String message() { return message; }
}
