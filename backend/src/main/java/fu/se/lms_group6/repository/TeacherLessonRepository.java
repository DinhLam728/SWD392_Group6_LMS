package fu.se.lms_group6.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fu.se.lms_group6.entity.Lesson;

public interface TeacherLessonRepository extends JpaRepository<Lesson, Long> {

    @Query("""
            select l from Lesson l
            join fetch l.module m
            join fetch m.course c
            join fetch c.teacher
            where l.lessonId = :lessonId
            """)
    Optional<Lesson> findWithOwner(@Param("lessonId") Long lessonId);

    List<Lesson> findByModuleCourseCourseIdOrderByModulePositionAscPositionAsc(Long courseId);

    List<Lesson> findByModuleModuleIdAndPositionGreaterThanOrderByPositionAsc(Long moduleId, Integer position);

    Optional<Lesson> findFirstByModuleModuleIdAndPositionLessThanOrderByPositionDesc(Long moduleId, Integer position);

    Optional<Lesson> findFirstByModuleModuleIdAndPositionGreaterThanOrderByPositionAsc(Long moduleId, Integer position);

    @Query("select coalesce(max(l.position), 0) from Lesson l where l.module.moduleId = :moduleId")
    int maxPosition(@Param("moduleId") Long moduleId);

    long countByModuleModuleId(Long moduleId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from Lesson l where l.module.moduleId = :moduleId")
    void deleteByModuleId(@Param("moduleId") Long moduleId);
}
