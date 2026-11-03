package fu.se.lms_group6.security;

import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentStudent {
    // JWT integration will supply the same student id here instead of trusting request input.
    public Long optionalId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof Long id) {
            return id;
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
