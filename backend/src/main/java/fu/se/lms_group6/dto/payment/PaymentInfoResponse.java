package fu.se.lms_group6.dto.payment;

import java.math.BigDecimal;

public record PaymentInfoResponse(
        String provider,
        String bank,
        String accountNumber,
        String accountName,
        BigDecimal amount,
        String paymentCode,
        String qrUrl
) {}
