package fu.se.lms_group6.repository;

import java.util.Optional;
import fu.se.lms_group6.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseId(Long courseId);
}
