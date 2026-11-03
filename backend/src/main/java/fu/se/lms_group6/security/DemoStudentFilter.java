package fu.se.lms_group6.security;

import fu.se.lms_group6.repository.UserRepository;
import fu.se.lms_group6.entity.enums.UserRole;
import fu.se.lms_group6.entity.enums.UserStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

// Constructed only inside the enrollment-demo security chain, never a servlet-wide filter.
public class DemoStudentFilter extends OncePerRequestFilter {
    private final UserRepository users;
    private final RestAuthenticationEntryPoint entryPoint;

    public DemoStudentFilter(UserRepository users, RestAuthenticationEntryPoint entryPoint) {
        this.users = users;
        this.entryPoint = entryPoint;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("X-User-Id");
        if (header != null && !"OPTIONS".equals(request.getMethod())) {
            Long id;
            try {
                id = Long.valueOf(header);
            } catch (NumberFormatException exception) {
                entryPoint.commence(request, response, new BadCredentialsException("Invalid demo user"));
                return;
            }
            var user = users.findById(id);
            if (user.isEmpty() || user.get().getRole() != UserRole.STUDENT || user.get().getStatus() != UserStatus.ACTIVE) {
                entryPoint.commence(request, response, new BadCredentialsException("Unavailable demo student"));
                return;
            }
            var authentication = UsernamePasswordAuthenticationToken.authenticated(id, null,
                    List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
        }
        chain.doFilter(request, response);
    }
}
