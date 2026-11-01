package fu.se.lms_group6.security;

import java.io.IOException;
import jakarta.servlet.http.*;
import fu.se.lms_group6.common.http.ApiErrorResponse;
import fu.se.lms_group6.common.exception.ErrorCode;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper mapper;
    public RestAuthenticationEntryPoint(ObjectMapper mapper) { this.mapper = mapper; }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException ex) throws IOException {
        response.setStatus(401);
        response.setHeader("WWW-Authenticate", "Basic realm=\"LMS\"");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getOutputStream(), ApiErrorResponse.of(ErrorCode.UNAUTHORIZED));
    }
}
