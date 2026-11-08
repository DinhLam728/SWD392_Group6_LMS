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
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Pattern PAYMENT_CODE = Pattern.compile("(?<![A-Z0-9])LMS[A-F0-9]{32}(?![A-Z0-9])");
    private static final DateTimeFormatter TRANSACTION_TIME = DateTimeFormatter
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
        String key = properties.getWebhookApiKey();
        if (key.isBlank() || authorization == null || !authorization.startsWith("Apikey ")
                || !MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8),
                        authorization.substring(7).getBytes(StandardCharsets.UTF_8))) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public String extractPaymentCode(SePayWebhookRequest request) {
        String code = request.code();
        if (code != null && PAYMENT_CODE.matcher(code).matches()) {
            return code;
        }
        var matcher = PAYMENT_CODE.matcher(request.content() == null ? "" : request.content());
        if (!matcher.find()) {
            return null;
        }
        String match = matcher.group();
        return matcher.find() ? null : match;
    }

    @Override
    public LocalDateTime verifyPayment(Registration registration, SePayWebhookRequest request) {
        if (!"in".equals(request.transferType()) || properties.getAccountNumber().isBlank()
                || !properties.getAccountNumber().equals(request.accountNumber())
                || (!properties.getSubAccount().isBlank() && !properties.getSubAccount().equals(request.subAccount()))
                || registration.getAmount().compareTo(request.transferAmount()) != 0) {
            return null;
        }
        try {
            LocalDateTime bankTime = LocalDateTime.parse(request.transactionDate(), TRANSACTION_TIME);
            LocalDateTime receivedAt = LocalDateTime.now(clock).withNano(0);
            LocalDateTime registeredAt = registration.getRegisteredAt();
            boolean sameRoundedMinute = bankTime.getSecond() == 0
                    && bankTime.equals(registeredAt.truncatedTo(ChronoUnit.MINUTES));
            if ((bankTime.isBefore(registeredAt) && !sameRoundedMinute) || !bankTime.isBefore(registration.getExpiresAt())
                    || bankTime.isAfter(receivedAt)) {
                return null;
            }
            return receivedAt;
        } catch (DateTimeParseException exception) {
            return null;
        }
    }
}
