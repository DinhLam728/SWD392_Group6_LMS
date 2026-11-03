package fu.se.lms_group6.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attempt_answers", uniqueConstraints = {@UniqueConstraint(name = "uq_attempt_question", columnNames = {"attempt_id", "question_id"})})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Long answerId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Setter
    @Column(name = "submitted_answer", columnDefinition = "TEXT")
    private String submittedAnswer;

    @Setter
    @Column(name = "is_correct")
    private Boolean isCorrect;

    public AttemptAnswer(QuizAttempt attempt, Question question) {
        this.attempt = attempt;
        this.question = question;
    }
}
