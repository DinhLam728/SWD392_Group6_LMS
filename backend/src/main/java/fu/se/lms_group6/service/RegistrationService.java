package fu.se.lms_group6.service;

import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.enrollment.RegistrationResponse;
import fu.se.lms_group6.dto.payment.SePayWebhookRequest;
import fu.se.lms_group6.entity.enums.PaymentStatus;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import org.springframework.data.domain.Pageable;

public interface RegistrationService {
    RegistrationResponse registerCourse(Long studentId, Long courseId);
    RegistrationResponse getRegistration(Long studentId, Long registrationId);
    PageResponse<RegistrationResponse> getRegistrations(Long studentId, String keyword,
            RegistrationStatus status, PaymentStatus paymentStatus, Pageable pageable);
    void handlePaymentWebhook(SePayWebhookRequest request);
    void simulatePayment(Long studentId, Long registrationId);
    int expireRegistrations();
}
