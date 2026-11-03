package fu.se.lms_group6.dto.enrollment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateRegistrationRequest(
        @NotNull @Positive Long courseId
) {}
