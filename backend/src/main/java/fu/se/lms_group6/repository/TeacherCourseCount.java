package fu.se.lms_group6.repository;

/** Projection for "number of children per course" queries. */
public interface TeacherCourseCount {
    Long getCourseId();

    Long getTotal();
}
