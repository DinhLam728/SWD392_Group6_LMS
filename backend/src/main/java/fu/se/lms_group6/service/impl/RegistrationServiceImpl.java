package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ConflictException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.enrollment.RegistrationResponse;
import fu.se.lms_group6.dto.payment.PaymentInfoResponse;
import fu.se.lms_group6.dto.payment.SePayWebhookRequest;
import fu.se.lms_group6.entity.Course;
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
import java.util.List;
import java.util.Optional;
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
    private static final int PAYMENT_TIMEOUT_HOURS = 24;

    private final RegistrationRepository registrations;
    private final CourseRepository courses;
    private final UserRepository users;
    private final PaymentService payments;
    private final Clock clock;

    public RegistrationServiceImpl(RegistrationRepository registrations, CourseRepository courses,
            UserRepository users, PaymentService payments, Clock enrollmentClock) {
        this.registrations = registrations;
        this.courses = courses;
        this.users = users;
        this.payments = payments;
        this.clock = enrollmentClock;
    }

    @Override
    public RegistrationResponse registerCourse(Long studentId, Long courseId) {
        User student = lockStudent(studentId);
        requireActiveStudent(student);
        Course course = courses.findById(courseId)
                .filter(Course::isAvailableForEnrollment)
                .orElseThrow(NotFoundException::new);

        List<Registration> previous = registrations.lockByStudentAndCourse(studentId, courseId);
        if (hasActive(previous)) {
            throw new ConflictException(ErrorCode.ALREADY_ENROLLED);
        }

        LocalDateTime now = now();
        for (Registration old : previous) {
            if (old.getStatus() != RegistrationStatus.PENDING) {
                continue;
            }
            if (old.getExpiresAt().isAfter(now)) {
                return toResponse(old, payments.createPayment(old));
            }
            old.setStatus(RegistrationStatus.EXPIRED);
        }

        Registration registration = new Registration(student, course, course.getPrice());
        registration.setRegisteredAt(now);
        registration.setExpiresAt(now.plusHours(PAYMENT_TIMEOUT_HOURS));
        registration.setPaymentCode(newPaymentCode());
        registrations.save(registration);
        return toResponse(registration, payments.createPayment(registration));
    }

    @Override
    @Transactional(readOnly = true)
    public RegistrationResponse getRegistration(Long studentId, Long registrationId) {
        requireActiveStudent(users.findById(studentId).orElseThrow(NotFoundException::new));
        Registration registration = registrations.findByRegistrationIdAndStudentUserId(registrationId, studentId)
                .orElseThrow(NotFoundException::new);
        PaymentInfoResponse payment = isWaitingForPayment(registration) ? payments.createPayment(registration) : null;
        return toResponse(registration, payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RegistrationResponse> getRegistrations(Long studentId, String keyword,
            RegistrationStatus status, PaymentStatus paymentStatus, Pageable pageable) {
        requireActiveStudent(users.findById(studentId).orElseThrow(NotFoundException::new));
        Specification<Registration> filter = (root, query, cb) -> cb.equal(root.get("student").get("userId"), studentId);
        if (status != null) {
            filter = filter.and(statusFilter(status));
        }
        if (paymentStatus != null) {
            filter = filter.and((root, query, cb) -> cb.equal(root.get("paymentStatus"), paymentStatus));
        }
        if (keyword != null && !keyword.isBlank()) {
            filter = filter.and(keywordFilter(keyword.strip()));
        }
        return PageResponse.from(registrations.findAll(filter, pageable).map(r -> toResponse(r, null)));
    }

    @Override
    public void handlePaymentWebhook(SePayWebhookRequest request) {
        String paymentCode = payments.extractPaymentCode(request);
        if (paymentCode == null) {
            log.info("Ignoring SePay transaction {}: no payment code", request.id());
            return;
        }
        Optional<Long> studentId = registrations.findStudentIdByPaymentCode(paymentCode);
        if (studentId.isEmpty()) {
            log.info("Ignoring SePay transaction {}: registration not found", request.id());
            return;
        }

        lockStudent(studentId.get());
        Registration registration = registrations.lockByPaymentCode(paymentCode).orElseThrow(NotFoundException::new);
        if (isDuplicatePayment(registration, request)) {
            log.info("Ignoring SePay transaction {}: already recorded", request.id());
            return;
        }
        if (!payments.verifyPayment(registration, request)) {
            log.warn("Ignoring SePay transaction {}: account, amount or time does not match", request.id());
            return;
        }

        activateRegistration(registration, request.transactionRef());
        log.info("Recorded SePay transaction {} for registration {}", request.id(), registration.getRegistrationId());
    }

    @Override
    public int expireRegistrations() {
        return registrations.expirePending(now());
    }

    private void activateRegistration(Registration registration, String transactionRef) {
        List<Registration> sameCourse = registrations.lockByStudentAndCourse(
                registration.getStudent().getUserId(), registration.getCourse().getCourseId());
        boolean alreadyEnrolled = hasActive(sameCourse);

        registration.markPaymentSuccess(transactionRef, now());
        if (alreadyEnrolled) {
            registration.setStatus(RegistrationStatus.EXPIRED);
        }

        for (Registration other : sameCourse) {
            boolean isOther = !other.getRegistrationId().equals(registration.getRegistrationId());
            if (isOther && other.getStatus() == RegistrationStatus.PENDING) {
                other.setStatus(RegistrationStatus.EXPIRED);
            }
        }
    }

    private boolean isDuplicatePayment(Registration registration, SePayWebhookRequest request) {
        return registration.getPaymentStatus() == PaymentStatus.SUCCESS
                || registrations.existsByTransactionRef(request.transactionRef());
    }

    private boolean isWaitingForPayment(Registration registration) {
        return displayStatus(registration) == RegistrationStatus.PENDING;
    }

    private RegistrationStatus displayStatus(Registration registration) {
        boolean expiredButNotUpdated = registration.getStatus() == RegistrationStatus.PENDING
                && !registration.getExpiresAt().isAfter(now());
        return expiredButNotUpdated ? RegistrationStatus.EXPIRED : registration.getStatus();
    }

    private RegistrationResponse toResponse(Registration registration, PaymentInfoResponse payment) {
        Course course = registration.getCourse();
        Long enrolledRegistrationId = registrations.findFirstByStudentUserIdAndCourseCourseIdAndStatus(
                        registration.getStudent().getUserId(), course.getCourseId(), RegistrationStatus.ACTIVE)
                .map(Registration::getRegistrationId)
                .orElse(null);
        return new RegistrationResponse(
                registration.getRegistrationId(),
                course.getCourseId(),
                course.getTitle(),
                course.getTeacher().getFullName(),
                registration.getAmount(),
                displayStatus(registration),
                registration.getPaymentStatus(),
                registration.getRegisteredAt(),
                registration.getExpiresAt(),
                registration.getPaidAt(),
                registration.getTransactionRef(),
                payment,
                enrolledRegistrationId);
    }

    private Specification<Registration> statusFilter(RegistrationStatus status) {
        LocalDateTime now = now();
        if (status == RegistrationStatus.PENDING) {
            return (root, query, cb) -> cb.and(
                    cb.equal(root.get("status"), RegistrationStatus.PENDING),
                    cb.greaterThan(root.get("expiresAt"), now));
        }
        if (status == RegistrationStatus.EXPIRED) {
            return (root, query, cb) -> cb.or(
                    cb.equal(root.get("status"), RegistrationStatus.EXPIRED),
                    cb.and(cb.equal(root.get("status"), RegistrationStatus.PENDING),
                            cb.lessThanOrEqualTo(root.get("expiresAt"), now)));
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private Specification<Registration> keywordFilter(String keyword) {
        String pattern = "%" + keyword.toLowerCase()
                .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
        Long registrationId = parseId(keyword);
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("course").get("title")), pattern, '!'),
                cb.equal(root.get("registrationId"), registrationId == null ? -1L : registrationId));
    }

    private boolean hasActive(List<Registration> list) {
        return list.stream().anyMatch(r -> r.getStatus() == RegistrationStatus.ACTIVE);
    }

    private User lockStudent(Long studentId) {
        return users.findByIdForUpdate(studentId).orElseThrow(NotFoundException::new);
    }

    private void requireActiveStudent(User user) {
        if (user.getRole() != UserRole.STUDENT || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private String newPaymentCode() {
        return "LMS" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
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
