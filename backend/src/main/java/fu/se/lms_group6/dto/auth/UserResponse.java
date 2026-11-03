package fu.se.lms_group6.dto.auth;

import fu.se.lms_group6.entity.enums.UserRole;
import fu.se.lms_group6.entity.enums.UserStatus;

public record UserResponse(
    Long userId,
    String fullName,
    String email,
    UserRole role,
    UserStatus status
) {}

