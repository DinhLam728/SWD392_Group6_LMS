package fu.se.lms_group6.repository;

/** Projection for "number of children per module" queries. */
public interface TeacherModuleCount {
    Long getModuleId();

    Long getTotal();
}
