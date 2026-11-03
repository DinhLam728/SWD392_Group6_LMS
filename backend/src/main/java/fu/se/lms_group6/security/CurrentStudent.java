package fu.se.lms_group6.security;

import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import fu.se.lms_group6.repository.UserRepository;

@Component
public class CurrentStudent {
    private final UserRepository users;

    public CurrentStudent(UserRepository users) {
        this.users = users;
    }
    public Long optionalId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof Long id) {
            return id;
        }
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof String email
                && !"anonymousUser".equals(email)) {
            return users.findByEmail(email).map(user -> user.getUserId()).orElse(null);
        }
        return null;
    }

    public Long requireId() {
        Long id = optionalId();
        if (id == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return id;
    }
}
