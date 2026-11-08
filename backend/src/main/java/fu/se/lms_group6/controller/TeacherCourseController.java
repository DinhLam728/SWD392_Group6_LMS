package fu.se.lms_group6.controller;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.PageRequestFactory;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
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
import fu.se.lms_group6.service.TeacherCourseService;

@RestController
@RequestMapping("/api/v1/teacher")
public class TeacherCourseController {
    private static final Set<String> COURSE_SORT_FIELDS = Set.of("courseId", "title", "price", "createdAt");

    private final TeacherCourseService service;
    private final CurrentTeacher teacher;
    private final Validator validator;

    public TeacherCourseController(TeacherCourseService service, CurrentTeacher teacher, Validator validator) {
        this.service = service;
        this.teacher = teacher;
        this.validator = validator;
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<PageResponse<TeacherCourseSummaryResponse>>> listCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "courseId,desc") String sort) {
        Long teacherId = teacher.requireId();
        var pageable = PageRequestFactory.create(page, size, sort, COURSE_SORT_FIELDS);
        return ResponseBuilder.ok(service.listCourses(teacherId, keyword, status, pageable));
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<TeacherCourseResponse>> createCourse(
            @Valid @RequestBody CreateCourseRequest request) {
        return ResponseBuilder.created(service.createCourse(teacher.requireId(), request));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<TeacherCourseResponse>> getCourse(@PathVariable Long courseId) {
        return ResponseBuilder.ok(service.getCourse(teacher.requireId(), courseId));
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<TeacherCourseResponse>> updateCourse(@PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseRequest request) {
        return ResponseBuilder.ok(service.updateCourse(teacher.requireId(), courseId, request));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        service.deleteCourse(teacher.requireId(), courseId);
        return ResponseBuilder.noContent();
    }

    @PatchMapping("/courses/{courseId}/publish")
    public ResponseEntity<ApiResponse<TeacherCourseResponse>> publishCourse(@PathVariable Long courseId) {
        return ResponseBuilder.ok(service.publishCourse(teacher.requireId(), courseId));
    }

    @PatchMapping("/courses/{courseId}/unpublish")
    public ResponseEntity<ApiResponse<TeacherCourseResponse>> unpublishCourse(@PathVariable Long courseId) {
        return ResponseBuilder.ok(service.unpublishCourse(teacher.requireId(), courseId));
    }

    @GetMapping("/courses/{courseId}/content")
    public ResponseEntity<ApiResponse<CourseContentResponse>> getContent(@PathVariable Long courseId) {
        return ResponseBuilder.ok(service.getContent(teacher.requireId(), courseId));
    }

    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<ApiResponse<TeacherModuleResponse>> addModule(@PathVariable Long courseId,
            @Valid @RequestBody ModuleRequest request) {
        return ResponseBuilder.created(service.addModule(teacher.requireId(), courseId, request));
    }

    @PutMapping("/modules/{moduleId}")
    public ResponseEntity<ApiResponse<TeacherModuleResponse>> updateModule(@PathVariable Long moduleId,
            @Valid @RequestBody ModuleRequest request) {
        return ResponseBuilder.ok(service.updateModule(teacher.requireId(), moduleId, request));
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long moduleId) {
        service.deleteModule(teacher.requireId(), moduleId);
        return ResponseBuilder.noContent();
    }

    @PatchMapping("/modules/{moduleId}/move")
    public ResponseEntity<Void> moveModule(@PathVariable Long moduleId, @RequestParam MoveDirection direction) {
        service.moveModule(teacher.requireId(), moduleId, direction);
        return ResponseBuilder.noContent();
    }

    @PostMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<ApiResponse<LessonResponse>> addLesson(@PathVariable Long moduleId,
            @Valid @RequestBody LessonRequest request) {
        return ResponseBuilder.created(service.addLesson(teacher.requireId(), moduleId, request));
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable Long lessonId) {
        return ResponseBuilder.ok(service.getLesson(teacher.requireId(), lessonId));
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(@PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request) {
        return ResponseBuilder.ok(service.updateLesson(teacher.requireId(), lessonId, request));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        service.deleteLesson(teacher.requireId(), lessonId);
        return ResponseBuilder.noContent();
    }

    @PatchMapping("/lessons/{lessonId}/move")
    public ResponseEntity<Void> moveLesson(@PathVariable Long lessonId, @RequestParam MoveDirection direction) {
        service.moveLesson(teacher.requireId(), lessonId, direction);
        return ResponseBuilder.noContent();
    }

    @PostMapping("/ai-lesson")
    public ResponseEntity<ApiResponse<AiLessonResponse>> generateLesson(@RequestBody AiLessonRequest request) {
        Long teacherId = teacher.requireId();
        if (request == null) {
            throw new BadRequestException();
        }
        Set<ConstraintViolation<AiLessonRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        return ResponseBuilder.ok(service.generateLessonContent(teacherId, request));
    }
}
