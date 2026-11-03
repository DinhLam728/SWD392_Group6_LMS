package fu.se.lms_group6.entity;

import fu.se.lms_group6.entity.enums.QuizAttemptStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quiz_attempts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attempt_id")
    private Long attemptId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Setter
    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QuizAttemptStatus status = QuizAttemptStatus.IN_PROGRESS;

    @Setter
    @Column(name = "started_at", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime startedAt;

    @Setter
    @Column(name = "submitted_at", columnDefinition = "DATETIME")
    private LocalDateTime submittedAt;

    public QuizAttempt(Quiz quiz, User student) {
        this.quiz = quiz;
        this.student = student;
    }

    @PrePersist
    protected void initializeTimestamps() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
}
