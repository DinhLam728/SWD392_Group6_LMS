package fu.se.lms_group6.service;

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

public interface AuthService {

    UserResponse register(RegisterRequest request);

    UserResponse verifyAccount(VerifyOtpRequest request);

    void resendOtp(ResendOtpRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void validateResetOtp(ValidateResetOtpRequest request);

    void resetPassword(ResetPasswordRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse loginWithGoogle(GoogleLoginRequest request);
}
