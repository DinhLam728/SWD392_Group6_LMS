package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.service.OtpService;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class OtpServiceImpl implements OtpService {

    private static final int OTP_EXPIRATION_SECONDS = 300;
    private final SecureRandom random = new SecureRandom();

    private record OtpEntry(String code, Instant expiresAt) {}

    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    @Override
    public String generateOtp(String email) {
        String key = normalizeEmail(email);
        int number = 100000 + random.nextInt(900000);
        String code = String.valueOf(number);
        Instant expiresAt = Instant.now().plusSeconds(OTP_EXPIRATION_SECONDS);

        otpStorage.put(key, new OtpEntry(code, expiresAt));
        return code;
    }

    @Override
    public boolean validateOtp(String email, String otpCode) {
        String key = normalizeEmail(email);
        OtpEntry entry = otpStorage.get(key);

        if (entry == null) {
            return false;
        }

        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStorage.remove(key);
            return false;
        }

        return entry.code().equals(otpCode.trim());
    }

    @Override
    public void clearOtp(String email) {
        otpStorage.remove(normalizeEmail(email));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}

