package fu.se.lms_group6.service;

import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.course.CourseDetailResponse;
import fu.se.lms_group6.dto.course.CourseSummaryResponse;
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;

public interface CourseService {
    PageResponse<CourseSummaryResponse> getCourses(String keyword, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    CourseDetailResponse getCourse(Long courseId, Long studentId);
}
