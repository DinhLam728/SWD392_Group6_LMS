package fu.se.lms_group6.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fu.se.lms_group6.entity.CourseModule;

public interface TeacherModuleRepository extends JpaRepository<CourseModule, Long> {

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

    @Query(value = "select count(*) from quizzes where module_id = :moduleId", nativeQuery = true)
    long countQuizzes(@Param("moduleId") Long moduleId);

    @Query(value = "select count(*) from quizzes where module_id = :moduleId and created_by is not null",
            nativeQuery = true)
    long countStudentQuizzes(@Param("moduleId") Long moduleId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "delete from quiz_configs where quiz_id in "
            + "(select quiz_id from quizzes where module_id = :moduleId and created_by is null)", nativeQuery = true)
    void deleteTeacherQuizConfigs(@Param("moduleId") Long moduleId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "delete from quizzes where module_id = :moduleId and created_by is null", nativeQuery = true)
    void deleteTeacherQuizzes(@Param("moduleId") Long moduleId);

    @Query(value = """
            select count(*) from questions qs
            join quizzes q on q.quiz_id = qs.quiz_id
            where q.module_id = :moduleId
            """, nativeQuery = true)
    long countQuizQuestions(@Param("moduleId") Long moduleId);

    @Query(value = """
            select count(*) from quiz_attempts a
            join quizzes q on q.quiz_id = a.quiz_id
            where q.module_id = :moduleId
            """, nativeQuery = true)
    long countQuizAttempts(@Param("moduleId") Long moduleId);

    @Query(value = "select module_id as moduleId, count(*) as total from quizzes "
            + "where module_id in (:moduleIds) and created_by is null group by module_id", nativeQuery = true)
    List<TeacherModuleCount> countQuizzesByModule(@Param("moduleIds") Collection<Long> moduleIds);
}
