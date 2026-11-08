package fu.se.lms_group6.dto.enrollment;

import fu.se.lms_group6.dto.payment.PaymentInfoResponse;
import fu.se.lms_group6.entity.enums.PaymentStatus;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RegistrationResponse(
        Long registrationId,
        Long courseId,
        String courseTitle,
        String teacherName,
        BigDecimal amount,
        RegistrationStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime registeredAt,
        LocalDateTime expiresAt,
        LocalDateTime paidAt,
        String transactionRef,
        PaymentInfoResponse payment,
        Long activeRegistrationId
) {}
