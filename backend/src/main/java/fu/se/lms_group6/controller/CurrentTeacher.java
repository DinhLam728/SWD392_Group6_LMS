package fu.se.lms_group6.controller;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.repository.UserRepository;

@Component
public class CurrentTeacher {
    private static final String TEACHER_AUTHORITY = "ROLE_TEACHER";

    private final UserRepository users;

    public CurrentTeacher(UserRepository users) {
        this.users = users;
    }

    public Long requireId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        boolean teacher = authentication.getAuthorities().stream()
                .anyMatch(authority -> TEACHER_AUTHORITY.equals(authority.getAuthority()));
        if (!teacher) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long id) {
            return id;
        }
        if (principal instanceof String email) {
            return users.findByEmail(email)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }
}
