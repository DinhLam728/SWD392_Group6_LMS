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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "courses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Setter
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Setter
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Setter
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Setter
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Setter
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    // Database-generated; historical rows may not have a recorded creation date.
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Course(User teacher, String title, BigDecimal price) {
        this.teacher = teacher;
        this.title = title;
        this.price = price;
    }
}
