package fu.se.lms_group6.controller;

import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.PageRequestFactory;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import fu.se.lms_group6.dto.enrollment.CreateRegistrationRequest;
import fu.se.lms_group6.dto.enrollment.RegistrationResponse;
import fu.se.lms_group6.dto.payment.SePayWebhookRequest;
import fu.se.lms_group6.entity.enums.PaymentStatus;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import fu.se.lms_group6.security.CurrentStudent;
import fu.se.lms_group6.service.PaymentService;
import fu.se.lms_group6.service.RegistrationService;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/registrations")
public class RegistrationController {
    private final RegistrationService registrations;
    private final PaymentService payments;
    private final CurrentStudent student;

    public RegistrationController(RegistrationService registrations, PaymentService payments, CurrentStudent student) {
        this.registrations = registrations;
        this.payments = payments;
        this.student = student;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(@Valid @RequestBody CreateRegistrationRequest request) {
        // 200 also covers reopening an existing pending registration.
        return ResponseBuilder.ok(registrations.registerCourse(student.requireId(), request.courseId()));
    }

    @GetMapping("/{registrationId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> detail(@PathVariable Long registrationId) {
        return ResponseBuilder.ok(registrations.getRegistration(student.requireId(), registrationId));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RegistrationResponse>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var pageable = PageRequestFactory.create(page, size, "registrationId,desc", Set.of("registrationId"));
        return ResponseBuilder.ok(registrations.getRegistrations(student.requireId(), keyword, status, paymentStatus, pageable));
    }

    @PostMapping("/webhooks/sepay")
    public Map<String, Boolean> webhook(@RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody SePayWebhookRequest request) {
        payments.authenticateWebhook(authorization);
        registrations.handlePaymentWebhook(request);
        // Acknowledgement means received, not necessarily that enrollment was activated.
        return Map.of("success", true);
    }
}
