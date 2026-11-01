package fu.se.lms_group6.common.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/** Helpers for successful controller responses. Errors go through exceptions. */
public final class ResponseBuilder {
    private ResponseBuilder() {}

    public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ok(data, "Thành công");
    }

    public static <T> ResponseEntity<ApiResponse<T>> ok(T data, String message) {
        return ResponseEntity.ok(ApiResponse.success(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return created(data, "Tạo mới thành công");
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, data));
    }

    public static ResponseEntity<Void> noContent() {
        return ResponseEntity.noContent().build();
    }
}
