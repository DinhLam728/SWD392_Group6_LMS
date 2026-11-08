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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final RegistrationService registrationService;
    private final PaymentService paymentService;
    private final CurrentStudent currentStudent;

    public RegistrationController(RegistrationService registrationService, PaymentService paymentService, CurrentStudent currentStudent) {
        this.registrationService = registrationService;
        this.paymentService = paymentService;
        this.currentStudent = currentStudent;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> registerCourse(@Valid @RequestBody CreateRegistrationRequest request) {
        return ResponseBuilder.ok(registrationService.registerCourse(currentStudent.requireId(), request.courseId()));
    }

    @GetMapping("/{registrationId}")
    public ResponseEntity<ApiResponse<RegistrationResponse>> getRegistration(@PathVariable Long registrationId) {
        return ResponseBuilder.ok(registrationService.getRegistration(currentStudent.requireId(), registrationId));
    }

    @PostMapping("/{registrationId}/demo-payment")
    public ResponseEntity<ApiResponse<RegistrationResponse>> simulatePayment(@PathVariable Long registrationId) {
        Long studentId = currentStudent.requireId();
        registrationService.simulatePayment(studentId, registrationId);
        return ResponseBuilder.ok(registrationService.getRegistration(studentId, registrationId));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RegistrationResponse>>> getRegistrations(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) RegistrationStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(defaultValue = "registeredAt,desc") String sort) {
        Pageable pageable = PageRequestFactory.create(page, size, sort, Set.of("registeredAt"));
        Pageable newestFirstOnTie = PageRequest.of(page, size, pageable.getSort().and(Sort.by("registrationId").descending()));
        return ResponseBuilder.ok(registrationService.getRegistrations(currentStudent.requireId(), keyword, status, paymentStatus, newestFirstOnTie));
    }

    @PostMapping("/webhooks/sepay")
    public Map<String, Boolean> handlePaymentWebhook(@RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody SePayWebhookRequest request) {
        paymentService.authenticateWebhook(authorization);
        registrationService.handlePaymentWebhook(request);
        return Map.of("success", true);
    }
}
