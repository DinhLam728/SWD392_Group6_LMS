package fu.se.lms_group6.dto.auth;

import fu.se.lms_group6.entity.Role;
import fu.se.lms_group6.entity.UserStatus;

public record UserResponse(
    Long userId,
    String fullName,
    String email,
    Role role,
    UserStatus status
) {}

