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
@Table(name = "modules", uniqueConstraints = {@UniqueConstraint(name = "uq_module_position", columnNames = {"course_id", "position"})})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "module_id")
    private Long moduleId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Setter
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Setter
    @Column(name = "position", nullable = false)
    private Integer position;

    public CourseModule(Course course, String title, Integer position) {
        this.course = course;
        this.title = title;
        this.position = position;
    }
}
