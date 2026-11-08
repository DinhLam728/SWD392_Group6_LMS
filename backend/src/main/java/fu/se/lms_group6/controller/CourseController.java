package fu.se.lms_group6.controller;

import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.PageRequestFactory;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import fu.se.lms_group6.dto.course.CourseDetailResponse;
import fu.se.lms_group6.dto.course.CourseSummaryResponse;
import fu.se.lms_group6.dto.course.LessonResponse;
import fu.se.lms_group6.security.CurrentStudent;
import fu.se.lms_group6.service.CourseService;
import java.math.BigDecimal;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {
    private final CurrentStudent student;
    private final CourseService courses;

    public CourseController(CourseService courses, CurrentStudent student) {
        this.student = student;
        this.courses = courses;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CourseSummaryResponse>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "courseId,desc") String sort) {
        var pageable = PageRequestFactory.create(page, size, sort, Set.of("courseId", "price", "title", "createdAt"));
        // Stable page boundaries when courses share the same creation time or price.
        if (pageable.getSort().getOrderFor("courseId") == null) {
            pageable = PageRequest.of(page, size, pageable.getSort().and(Sort.by(Sort.Direction.DESC, "courseId")));
        }
        return ResponseBuilder.ok(courses.getCourses(keyword, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseDetailResponse>> detail(@PathVariable Long courseId) {
        return ResponseBuilder.ok(courses.getCourse(courseId, student.optionalId()));
    }

    @GetMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> lesson(@PathVariable Long courseId, @PathVariable Long lessonId) {
        return ResponseBuilder.ok(courses.getLesson(courseId, lessonId, student.requireId()));
    }
}
