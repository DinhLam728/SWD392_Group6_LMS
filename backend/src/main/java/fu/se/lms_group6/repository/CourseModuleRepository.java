package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseCourseIdOrderByPositionAsc(Long courseId);
}
