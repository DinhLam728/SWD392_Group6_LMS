package fu.se.lms_group6.service;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otpCode);

    void sendResetPasswordEmail(String toEmail, String otpCode);
}
