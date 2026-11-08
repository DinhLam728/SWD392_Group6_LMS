package fu.se.lms_group6.controller;

import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import fu.se.lms_group6.dto.auth.AuthResponse;
import fu.se.lms_group6.dto.auth.ForgotPasswordRequest;
import fu.se.lms_group6.dto.auth.GoogleLoginRequest;
import fu.se.lms_group6.dto.auth.LoginRequest;
import fu.se.lms_group6.dto.auth.RegisterRequest;
import fu.se.lms_group6.dto.auth.ResendOtpRequest;
import fu.se.lms_group6.dto.auth.ResetPasswordRequest;
import fu.se.lms_group6.dto.auth.UserResponse;
import fu.se.lms_group6.dto.auth.ValidateResetOtpRequest;
import fu.se.lms_group6.dto.auth.VerifyOtpRequest;
import fu.se.lms_group6.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String COOKIE_NAME = "access_token";
    private static final Duration COOKIE_EXPIRY = Duration.ofDays(7);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseBuilder.created(response, "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực OTP.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<UserResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        UserResponse response = authService.verifyAccount(request);
        return ResponseBuilder.ok(response, "Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseBuilder.ok(null, "Mã OTP mới đã được gửi lại vào email.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseBuilder.ok(null, "Mã xác thực đặt lại mật khẩu đã được gửi đến email của bạn.");
    }

    @PostMapping("/validate-reset-otp")
    public ResponseEntity<ApiResponse<Void>> validateResetOtp(@Valid @RequestBody ValidateResetOtpRequest request) {
        authService.validateResetOtp(request);
        return ResponseBuilder.ok(null, "Mã OTP hợp lệ.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseBuilder.ok(null, "Mật khẩu của bạn đã được cập nhật thành công.");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie cookie = createAuthCookie(response.token(), COOKIE_EXPIRY);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ResponseBuilder.ok(response.user(), "Đăng nhập thành công").getBody());
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<UserResponse>> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        ResponseCookie cookie = createAuthCookie(response.token(), COOKIE_EXPIRY);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ResponseBuilder.ok(response.user(), "Đăng nhập với Google thành công").getBody());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal String email) {
        UserResponse response = authService.getCurrentUser(email);
        return ResponseBuilder.ok(response, "Lấy thông tin người dùng thành công");
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie cookie = createAuthCookie("", Duration.ZERO);
        ApiResponse<Void> body = ApiResponse.success("Đăng xuất thành công", null);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }

    private ResponseCookie createAuthCookie(String token, Duration maxAge) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Đặt true khi deploy HTTPS
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
