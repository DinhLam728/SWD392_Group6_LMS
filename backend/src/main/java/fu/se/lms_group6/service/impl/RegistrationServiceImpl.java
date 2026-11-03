package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ConflictException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.enrollment.RegistrationResponse;
import fu.se.lms_group6.dto.payment.SePayWebhookRequest;
import fu.se.lms_group6.entity.Registration;
import fu.se.lms_group6.entity.User;
import fu.se.lms_group6.entity.enums.PaymentStatus;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import fu.se.lms_group6.entity.enums.UserRole;
import fu.se.lms_group6.entity.enums.UserStatus;
import fu.se.lms_group6.repository.CourseRepository;
import fu.se.lms_group6.repository.RegistrationRepository;
import fu.se.lms_group6.repository.UserRepository;
import fu.se.lms_group6.service.PaymentService;
import fu.se.lms_group6.service.RegistrationService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RegistrationServiceImpl implements RegistrationService {
    private static final Logger log = LoggerFactory.getLogger(RegistrationServiceImpl.class);
    private final Clock clock;
    private final RegistrationRepository registrations;
    private final CourseRepository courses;
    private final UserRepository users;
    private final PaymentService payments;

    public RegistrationServiceImpl(RegistrationRepository registrations, CourseRepository courses,
            UserRepository users, PaymentService payments, Clock enrollmentClock) {
        this.clock = enrollmentClock;
        this.registrations = registrations;
        this.courses = courses;
        this.users = users;
        this.payments = payments;
    }

    @Override
    public RegistrationResponse registerCourse(Long studentId, Long courseId) {
        // Lock the existing user row even when no registration exists yet.
        User student = users.findByIdForUpdate(studentId).orElseThrow(NotFoundException::new);
        requireStudent(student);
        var course = courses.findById(courseId).filter(c -> Boolean.TRUE.equals(c.getIsPublished()))
                .orElseThrow(NotFoundException::new);
        if (course.getPrice().signum() <= 0 || course.getPrice().stripTrailingZeros().scale() > 0) {
            throw new BadRequestException();
        }
        LocalDateTime now = now();
        var previous = registrations.findByStudentUserIdAndCourseCourseIdOrderByRegisteredAtDesc(studentId, courseId);
        if (previous.stream().anyMatch(r -> r.getStatus() == RegistrationStatus.ACTIVE)) {
            throw new ConflictException();
        }
        for (Registration registration : previous) {
            if (registration.getStatus() == RegistrationStatus.PENDING) {
                if (registration.getExpiresAt().isAfter(now)) {
                    return toResponse(registration, true);
                }
                registration.setStatus(RegistrationStatus.EXPIRED);
            }
        }
        Registration registration = new Registration(student, course, course.getPrice());
        registration.setRegisteredAt(now);
        registration.setExpiresAt(now.plusHours(24));
        registration.setPaymentCode("LMS" + UUID.randomUUID().toString().replace("-", "").toUpperCase());
        registrations.save(registration);
        return toResponse(registration, true);
    }

    @Override
    @Transactional(readOnly = true)
    public RegistrationResponse getRegistration(Long studentId, Long registrationId) {
        requireStudent(users.findById(studentId).orElseThrow(NotFoundException::new));
        Registration registration = registrations.findByRegistrationIdAndStudentUserId(registrationId, studentId)
                .orElseThrow(NotFoundException::new);
        return toResponse(registration, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RegistrationResponse> getRegistrations(Long studentId, String keyword,
            RegistrationStatus status, PaymentStatus paymentStatus, Pageable pageable) {
        requireStudent(users.findById(studentId).orElseThrow(NotFoundException::new));
        LocalDateTime now = now();
        Specification<Registration> filter = (root, query, cb) -> cb.equal(root.get("student").get("userId"), studentId);
        if (status == RegistrationStatus.PENDING) {
            filter = filter.and((root, query, cb) -> cb.and(cb.equal(root.get("status"), status), cb.greaterThan(root.get("expiresAt"), now)));
        } else if (status == RegistrationStatus.EXPIRED) {
            filter = filter.and((root, query, cb) -> cb.or(cb.equal(root.get("status"), status),
                    cb.and(cb.equal(root.get("status"), RegistrationStatus.PENDING), cb.lessThanOrEqualTo(root.get("expiresAt"), now))));
        } else if (status != null) {
            filter = filter.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (paymentStatus != null) {
            filter = filter.and((root, query, cb) -> cb.equal(root.get("paymentStatus"), paymentStatus));
        }
        if (keyword != null && !keyword.isBlank()) {
            String text = keyword.strip().toLowerCase().replace("!", "!!").replace("%", "!%").replace("_", "!_");
            Long id = parseId(keyword.strip());
            filter = filter.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("course").get("title")), "%" + text + "%", '!'),
                    cb.equal(root.get("registrationId"), id == null ? -1L : id)));
        }
        return PageResponse.from(registrations.findAll(filter, pageable).map(r -> toResponse(r, false)));
    }

    @Override
    public int expireRegistrations() {
        return registrations.expirePending(now());
    }

    @Override
    public void handlePaymentWebhook(SePayWebhookRequest request) {
        String code = payments.extractPaymentCode(request);
        if (code == null) {
            log.info("Ignoring SePay transaction {}: no unique payment code", request.id());
            return;
        }
        var owner = registrations.findStudentIdByPaymentCode(code);
        if (owner.isEmpty()) {
            log.info("Ignoring SePay transaction {}: registration not found", request.id());
            return;
        }
        // Same lock order as registration creation: user first, then registration rows.
        users.findByIdForUpdate(owner.get()).orElseThrow(NotFoundException::new);
        Registration registration = registrations.findByPaymentCodeForUpdate(code).orElseThrow(NotFoundException::new);
        if (registration.getPaymentStatus() == PaymentStatus.SUCCESS
                || registrations.existsByTransactionRef(request.transactionRef())) {
            log.info("Ignoring repeated payment for registration {}, transaction {}", registration.getRegistrationId(), request.id());
            return;
        }
        LocalDateTime paidAt = payments.verifyPayment(registration, request);
        if (paidAt == null) {
            log.warn("Ignoring SePay transaction {}: account, amount or payment time does not match", request.id());
            return;
        }
        var related = registrations.findByStudentUserIdAndCourseCourseIdOrderByRegisteredAtDesc(
                owner.get(), registration.getCourse().getCourseId());
        boolean alreadyEnrolled = related.stream().anyMatch(r -> r.getStatus() == RegistrationStatus.ACTIVE);
        registration.setPaymentStatus(PaymentStatus.SUCCESS);
        registration.setTransactionRef(request.transactionRef());
        registration.setPaidAt(paidAt);
        // A valid late receipt is retained, but never grants a second enrollment.
        registration.setStatus(alreadyEnrolled ? RegistrationStatus.EXPIRED : RegistrationStatus.ACTIVE);
        for (Registration other : related) {
            if (!other.getRegistrationId().equals(registration.getRegistrationId())
                    && other.getStatus() == RegistrationStatus.PENDING) {
                other.setStatus(RegistrationStatus.EXPIRED);
            }
        }
        log.info("Recorded SePay transaction {} for registration {}, activated={}",
                request.id(), registration.getRegistrationId(), !alreadyEnrolled);
    }

    private RegistrationResponse toResponse(Registration registration, boolean includePayment) {
        RegistrationStatus status = registration.getStatus();
        if (status == RegistrationStatus.PENDING && !registration.getExpiresAt().isAfter(now())) {
            status = RegistrationStatus.EXPIRED;
        }
        var payment = includePayment && status == RegistrationStatus.PENDING
                ? payments.createPayment(registration) : null;
        return new RegistrationResponse(registration.getRegistrationId(), registration.getCourse().getCourseId(),
                registration.getCourse().getTitle(), registration.getAmount(), status, registration.getPaymentStatus(),
                registration.getRegisteredAt(), registration.getExpiresAt(), registration.getPaidAt(), registration.getTransactionRef(), payment,
                registrations.findFirstByStudentUserIdAndCourseCourseIdAndStatus(
                        registration.getStudent().getUserId(), registration.getCourse().getCourseId(), RegistrationStatus.ACTIVE)
                        .map(Registration::getRegistrationId).orElse(null));
    }

    private void requireStudent(User user) {
        if (user.getRole() != UserRole.STUDENT || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private Long parseId(String value) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock).withNano(0);
    }
}
