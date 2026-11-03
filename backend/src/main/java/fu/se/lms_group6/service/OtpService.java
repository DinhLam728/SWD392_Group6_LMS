package fu.se.lms_group6.service;

public interface OtpService {

    String generateOtp(String email);

    boolean validateOtp(String email, String otpCode);

    void clearOtp(String email);
}

