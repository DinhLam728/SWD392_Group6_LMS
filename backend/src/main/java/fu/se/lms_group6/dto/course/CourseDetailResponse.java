package fu.se.lms_group6.dto.course;

import java.util.List;

public record CourseDetailResponse(
        CourseSummaryResponse course,
        List<ModuleResponse> modules,
        Long registrationId,
        String registrationStatus
) {}
