package fu.se.lms_group6.entity;

import fu.se.lms_group6.entity.enums.PaymentStatus;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "registrations", indexes = @Index(name = "idx_registration_student_course", columnList = "student_id, course_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registration_id")
    private Long registrationId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Setter
    @Column(name = "registered_at", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime registeredAt;

    @Setter
    @Column(name = "expires_at", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime expiresAt;

    @Setter
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Setter
    @Column(name = "payment_code", unique = true, length = 50)
    private String paymentCode;

    @Setter
    @Column(name = "transaction_ref", unique = true, length = 100)
    private String transactionRef;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Setter
    @Column(name = "paid_at", columnDefinition = "DATETIME")
    private LocalDateTime paidAt;

    public Registration(User student, Course course, BigDecimal amount) {
        this.student = student;
        this.course = course;
        this.amount = amount;
    }

    public void markPaymentSuccess(String transactionRef, LocalDateTime paidAt) {
        this.paymentStatus = PaymentStatus.SUCCESS;
        this.transactionRef = transactionRef;
        this.paidAt = paidAt;
        this.status = RegistrationStatus.ACTIVE;
    }
}
