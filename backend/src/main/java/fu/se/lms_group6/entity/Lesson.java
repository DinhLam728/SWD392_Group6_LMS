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
@Table(name = "lessons", uniqueConstraints = {@UniqueConstraint(name = "uq_lesson_position", columnNames = {"module_id", "position"})})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    private Long lessonId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @Setter
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Setter
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Setter
    @Column(name = "position", nullable = false)
    private Integer position;

    public Lesson(CourseModule module, String title, Integer position) {
        this.module = module;
        this.title = title;
        this.position = position;
    }
}
