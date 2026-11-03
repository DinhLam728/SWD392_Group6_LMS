package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.Lesson;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleCourseCourseIdOrderByModulePositionAscPositionAsc(Long courseId);
}
