package fu.se.lms_group6.service;

import fu.se.lms_group6.dto.payment.PaymentInfoResponse;
import fu.se.lms_group6.dto.payment.SePayWebhookRequest;
import fu.se.lms_group6.entity.Registration;
import java.time.LocalDateTime;

public interface PaymentService {
    PaymentInfoResponse createPayment(Registration registration);
    void authenticateWebhook(String authorization);
    String extractPaymentCode(SePayWebhookRequest request);
    LocalDateTime verifyPayment(Registration registration, SePayWebhookRequest request);
}
