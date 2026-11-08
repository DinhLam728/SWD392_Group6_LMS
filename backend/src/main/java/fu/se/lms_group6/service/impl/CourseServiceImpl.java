package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.course.CourseDetailResponse;
import fu.se.lms_group6.dto.course.CourseSummaryResponse;
import fu.se.lms_group6.dto.course.LessonResponse;
import fu.se.lms_group6.dto.course.ModuleResponse;
import fu.se.lms_group6.entity.Course;
import fu.se.lms_group6.entity.Lesson;
import fu.se.lms_group6.entity.Registration;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import fu.se.lms_group6.repository.CourseModuleRepository;
import fu.se.lms_group6.repository.CourseRepository;
import fu.se.lms_group6.repository.RegistrationRepository;
import fu.se.lms_group6.service.CourseService;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;
import java.util.stream.Collectors;
import fu.se.lms_group6.dto.course.LessonSummaryResponse;
import fu.se.lms_group6.dto.course.QuizSummaryResponse;
import fu.se.lms_group6.entity.enums.QuizStatus;
import fu.se.lms_group6.repository.LessonRepository;
import fu.se.lms_group6.repository.QuizRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {
    private final RegistrationRepository registrations;
    private final Clock clock;
    private final CourseRepository courses;
    private final CourseModuleRepository modules;
    private final LessonRepository lessons;
    private final QuizRepository quizzes;

    public CourseServiceImpl(CourseRepository courses, CourseModuleRepository modules, RegistrationRepository registrations, Clock enrollmentClock, LessonRepository lessons, QuizRepository quizzes) {
        this.registrations = registrations;
        this.clock = enrollmentClock;
        this.courses = courses;
        this.modules = modules;
        this.lessons = lessons;
        this.quizzes = quizzes;
    }

    @Override
    public PageResponse<CourseSummaryResponse> getCourses(String keyword, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        if ((minPrice != null && minPrice.signum() < 0) || (maxPrice != null && maxPrice.signum() < 0)
                || (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0)) {
            throw new BadRequestException();
        }
        Specification<Course> filter = (root, query, cb) -> cb.isTrue(root.get("isPublished"));
        if (keyword != null && !keyword.isBlank()) {
            String text = keyword.strip().toLowerCase(Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_");
            String pattern = "%" + text + "%";
            filter = filter.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), pattern, '!'),
                    cb.like(cb.lower(root.get("description")), pattern, '!'),
                    cb.like(cb.lower(root.get("teacher").get("fullName")), pattern, '!')));
        }
        if (minPrice != null) {
            filter = filter.and((root, query, cb) -> cb.ge(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            filter = filter.and((root, query, cb) -> cb.le(root.get("price"), maxPrice));
        }
        return PageResponse.from(courses.findAll(filter, pageable).map(this::toSummary));
    }

    @Override
    public CourseDetailResponse getCourse(Long courseId, Long studentId) {
        Course course = courses.findById(courseId).filter(c -> Boolean.TRUE.equals(c.getIsPublished()))
                .orElseThrow(NotFoundException::new);
        var lessonTitles = lessons.findByModuleCourseCourseIdOrderByModulePositionAscPositionAsc(courseId).stream()
                .collect(Collectors.groupingBy(lesson -> lesson.getModule().getModuleId(),
                        Collectors.mapping(lesson -> new LessonSummaryResponse(lesson.getLessonId(), lesson.getTitle(), lesson.getPosition()), Collectors.toList())));
        var quizTitles = quizzes.findByModuleCourseCourseIdAndStatusOrderByQuizIdAsc(courseId, QuizStatus.ACTIVE).stream()
                .filter(quiz -> quiz.getCreatedBy() != null && quiz.getCreatedBy().getUserId().equals(studentId))
                .collect(Collectors.groupingBy(quiz -> quiz.getModule().getModuleId(),
                        Collectors.mapping(quiz -> new QuizSummaryResponse(quiz.getQuizId(), quiz.getTitle()), Collectors.toList())));
        var outline = modules.findByCourseCourseIdOrderByPositionAsc(courseId).stream()
                .map(m -> new ModuleResponse(m.getModuleId(), m.getTitle(), m.getPosition(),
                        lessonTitles.getOrDefault(m.getModuleId(), List.of()), quizTitles.getOrDefault(m.getModuleId(), List.of()))).toList();
        Registration registration = null;
        if (studentId != null) {
            registration = registrations.findFirstByStudentUserIdAndCourseCourseIdAndStatus(studentId, courseId, RegistrationStatus.ACTIVE)
                    .orElseGet(() -> registrations.findUnexpiredPending(studentId, courseId, LocalDateTime.now(clock))
                            .stream().findFirst().orElse(null));
        }
        return new CourseDetailResponse(toSummary(course), outline,
                registration == null ? null : registration.getRegistrationId(),
                registration == null ? null : registration.getStatus().name());
    }

    @Override
    public LessonResponse getLesson(Long courseId, Long lessonId, Long studentId) {
        if (registrations.findFirstByStudentUserIdAndCourseCourseIdAndStatus(
                studentId, courseId, RegistrationStatus.ACTIVE).isEmpty()) {
            throw new BusinessException(ErrorCode.LESSON_NOT_ENROLLED);
        }
        Lesson lesson = lessons.findById(lessonId)
                .filter(l -> l.getModule().getCourse().getCourseId().equals(courseId)
                        && Boolean.TRUE.equals(l.getModule().getCourse().getIsPublished()))
                .orElseThrow(NotFoundException::new);
        var module = lesson.getModule();
        return new LessonResponse(lesson.getLessonId(), module.getModuleId(), courseId, module.getTitle(),
                lesson.getTitle(), lesson.getContent(), lesson.getPosition());
    }

    private CourseSummaryResponse toSummary(Course course) {
        return new CourseSummaryResponse(course.getCourseId(), course.getTitle(), course.getDescription(),
                course.getThumbnailUrl(), course.getPrice(), course.getTeacher().getUserId(), course.getTeacher().getFullName(), course.getCreatedAt());
    }
}
