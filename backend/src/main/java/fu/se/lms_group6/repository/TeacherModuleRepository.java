package fu.se.lms_group6.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fu.se.lms_group6.entity.CourseModule;

public interface TeacherModuleRepository extends JpaRepository<CourseModule, Long> {

    // Course and teacher are fetched so ownership and the AI prompt context need no open session.
    @Query("""
            select m from CourseModule m
            join fetch m.course c
            join fetch c.teacher
            where m.moduleId = :moduleId
            """)
    Optional<CourseModule> findWithOwner(@Param("moduleId") Long moduleId);

    List<CourseModule> findByCourseCourseIdOrderByPositionAsc(Long courseId);

    List<CourseModule> findByCourseCourseIdAndPositionGreaterThanOrderByPositionAsc(Long courseId, Integer position);

    Optional<CourseModule> findFirstByCourseCourseIdAndPositionLessThanOrderByPositionDesc(Long courseId, Integer position);

    Optional<CourseModule> findFirstByCourseCourseIdAndPositionGreaterThanOrderByPositionAsc(Long courseId, Integer position);

    @Query("select coalesce(max(m.position), 0) from CourseModule m where m.course.courseId = :courseId")
    int maxPosition(@Param("courseId") Long courseId);

    // Quizzes belong to another feature and have no entity here.
    @Query(value = "select count(*) from quizzes where module_id = :moduleId", nativeQuery = true)
    long countQuizzes(@Param("moduleId") Long moduleId);
}
