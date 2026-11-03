package fu.se.lms_group6.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quiz_configs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuizConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Long configId;

    @Setter
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false, unique = true)
    private Quiz quiz;

    @Setter
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30;

    @Setter
    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 1;

    @Setter
    @Column(name = "passing_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal passingScore = new BigDecimal("5.00");

    @Setter
    @Column(name = "question_count")
    private Integer questionCount;

    @Setter
    @Column(name = "random_questions", nullable = false)
    private Boolean randomQuestions = false;

    @Setter
    @Column(name = "shuffle_questions", nullable = false)
    private Boolean shuffleQuestions = false;

    @Setter
    @Column(name = "shuffle_options", nullable = false)
    private Boolean shuffleOptions = false;

    public QuizConfig(Quiz quiz) {
        this.quiz = quiz;
    }
}
