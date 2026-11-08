package fu.se.lms_group6.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fu.se.lms_group6.entity.Course;

public interface TeacherCourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    @Query("select c from Course c join fetch c.teacher where c.courseId = :courseId")
    Optional<Course> findWithTeacher(@Param("courseId") Long courseId);

    @Query("""
            select m.course.courseId as courseId, count(m) as total
            from CourseModule m
            where m.course.courseId in :courseIds
            group by m.course.courseId
            """)
    List<TeacherCourseCount> countModules(@Param("courseIds") Collection<Long> courseIds);

    @Query("""
            select l.module.course.courseId as courseId, count(l) as total
            from Lesson l
            where l.module.course.courseId in :courseIds
            group by l.module.course.courseId
            """)
    List<TeacherCourseCount> countLessons(@Param("courseIds") Collection<Long> courseIds);

    @Query(value = "select count(*) from registrations where course_id = :courseId", nativeQuery = true)
    long countRegistrations(@Param("courseId") Long courseId);

    @Query(value = "select count(*) from registrations where course_id = :courseId and status = 'ACTIVE'",
            nativeQuery = true)
    long countActiveStudents(@Param("courseId") Long courseId);

    @Query(value = "select course_id as courseId, count(*) as total from registrations "
            + "where status = 'ACTIVE' and course_id in (:courseIds) group by course_id", nativeQuery = true)
    List<TeacherCourseCount> activeStudentCounts(@Param("courseIds") Collection<Long> courseIds);

    @Query(value = "select count(*) from questions where course_id = :courseId", nativeQuery = true)
    long countQuestions(@Param("courseId") Long courseId);

    @Query(value = """
            select count(*) from quizzes q
            join modules m on m.module_id = q.module_id
            where m.course_id = :courseId
            """, nativeQuery = true)
    long countQuizzes(@Param("courseId") Long courseId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            delete from Lesson l
            where l.module.moduleId in (select m.moduleId from CourseModule m where m.course.courseId = :courseId)
            """)
    void deleteLessonsOfCourse(@Param("courseId") Long courseId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from CourseModule m where m.course.courseId = :courseId")
    void deleteModulesOfCourse(@Param("courseId") Long courseId);
}
