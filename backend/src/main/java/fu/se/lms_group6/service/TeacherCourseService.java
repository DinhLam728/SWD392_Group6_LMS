package fu.se.lms_group6.service;

import org.springframework.data.domain.Pageable;

import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.course.AiLessonRequest;
import fu.se.lms_group6.dto.course.AiLessonResponse;
import fu.se.lms_group6.dto.course.CourseContentResponse;
import fu.se.lms_group6.dto.course.CreateCourseRequest;
import fu.se.lms_group6.dto.course.LessonRequest;
import fu.se.lms_group6.dto.course.LessonResponse;
import fu.se.lms_group6.dto.course.ModuleRequest;
import fu.se.lms_group6.dto.course.MoveDirection;
import fu.se.lms_group6.dto.course.TeacherCourseResponse;
import fu.se.lms_group6.dto.course.TeacherCourseSummaryResponse;
import fu.se.lms_group6.dto.course.TeacherModuleResponse;
import fu.se.lms_group6.dto.course.UpdateCourseRequest;

/** Manage Courses for the logged-in Teacher. Every method refuses data owned by another Teacher (403). */
public interface TeacherCourseService {

    PageResponse<TeacherCourseSummaryResponse> listCourses(Long teacherId, String keyword, String status, Pageable pageable);

    TeacherCourseResponse createCourse(Long teacherId, CreateCourseRequest request);

    TeacherCourseResponse getCourse(Long teacherId, Long courseId);

    TeacherCourseResponse updateCourse(Long teacherId, Long courseId, UpdateCourseRequest request);

    void deleteCourse(Long teacherId, Long courseId);

    TeacherCourseResponse publishCourse(Long teacherId, Long courseId);

    TeacherCourseResponse unpublishCourse(Long teacherId, Long courseId);

    CourseContentResponse getContent(Long teacherId, Long courseId);

    TeacherModuleResponse addModule(Long teacherId, Long courseId, ModuleRequest request);

    TeacherModuleResponse updateModule(Long teacherId, Long moduleId, ModuleRequest request);

    void deleteModule(Long teacherId, Long moduleId);

    void moveModule(Long teacherId, Long moduleId, MoveDirection direction);

    LessonResponse addLesson(Long teacherId, Long moduleId, LessonRequest request);

    LessonResponse getLesson(Long teacherId, Long lessonId);

    LessonResponse updateLesson(Long teacherId, Long lessonId, LessonRequest request);

    void deleteLesson(Long teacherId, Long lessonId);

    void moveLesson(Long teacherId, Long lessonId, MoveDirection direction);

    /** Asks Gemini for a draft. Nothing is stored: the lesson is saved only when the Teacher saves the form. */
    AiLessonResponse generateLessonContent(Long teacherId, AiLessonRequest request);
}
