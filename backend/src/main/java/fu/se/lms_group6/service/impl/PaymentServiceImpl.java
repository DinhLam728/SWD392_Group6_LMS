package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.dto.payment.PaymentInfoResponse;
import fu.se.lms_group6.dto.payment.SePayWebhookRequest;
import fu.se.lms_group6.entity.Registration;
import fu.se.lms_group6.externalclient.sepay.SePayProperties;
import fu.se.lms_group6.externalclient.sepay.SePayProxy;
import fu.se.lms_group6.service.PaymentService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.regex.MatchResult;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Pattern PAYMENT_CODE = Pattern.compile("(?<![A-Z0-9])LMS[A-F0-9]{32}(?![A-Z0-9])");
    private static final DateTimeFormatter BANK_TIME_FORMAT = DateTimeFormatter
            .ofPattern("uuuu-MM-dd HH:mm:ss").withResolverStyle(ResolverStyle.STRICT);

    private final SePayProxy sePayProxy;
    private final SePayProperties properties;
    private final Clock clock;

    public PaymentServiceImpl(SePayProxy sePayProxy, SePayProperties properties, Clock enrollmentClock) {
        this.sePayProxy = sePayProxy;
        this.properties = properties;
        this.clock = enrollmentClock;
    }

    @Override
    public PaymentInfoResponse createPayment(Registration registration) {
        return sePayProxy.generatePaymentQR(registration.getAmount(), registration.getPaymentCode());
    }

    @Override
    public void authenticateWebhook(String authorization) {
        String expected = "Apikey " + properties.getWebhookApiKey();
        boolean valid = !properties.getWebhookApiKey().isBlank()
                && authorization != null
                && MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                        authorization.getBytes(StandardCharsets.UTF_8));
        if (!valid) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public String extractPaymentCode(SePayWebhookRequest request) {
        if (request.code() != null && PAYMENT_CODE.matcher(request.code()).matches()) {
            return request.code();
        }
        List<String> codesInContent = PAYMENT_CODE.matcher(Objects.toString(request.content(), ""))
                .results()
                .map(MatchResult::group)
                .toList();
        return codesInContent.size() == 1 ? codesInContent.get(0) : null;
    }

    @Override
    public boolean verifyPayment(Registration registration, SePayWebhookRequest request) {
        boolean moneyIn = "in".equals(request.transferType());
        boolean correctAccount = !properties.getAccountNumber().isBlank()
                && properties.getAccountNumber().equals(request.accountNumber())
                && (properties.getSubAccount().isBlank() || properties.getSubAccount().equals(request.subAccount()));
        boolean correctAmount = registration.getAmount().compareTo(request.transferAmount()) == 0;
        return moneyIn && correctAccount && correctAmount && paidInTime(registration, request.transactionDate());
    }

    private boolean paidInTime(Registration registration, String transactionDate) {
        LocalDateTime bankTime;
        try {
            bankTime = LocalDateTime.parse(transactionDate, BANK_TIME_FORMAT);
        } catch (DateTimeParseException exception) {
            return false;
        }
        LocalDateTime registeredMinute = registration.getRegisteredAt().truncatedTo(ChronoUnit.MINUTES);
        boolean afterRegistration = !bankTime.isBefore(registeredMinute);
        boolean beforeExpiry = bankTime.isBefore(registration.getExpiresAt());
        boolean notInFuture = !bankTime.isAfter(LocalDateTime.now(clock));
        return afterRegistration && beforeExpiry && notInFuture;
    }
}
