package fu.se.lms_group6.security;

import java.io.IOException;
import jakarta.servlet.http.*;
import fu.se.lms_group6.common.http.ApiErrorResponse;
import fu.se.lms_group6.common.exception.ErrorCode;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper mapper;
    public RestAccessDeniedHandler(ObjectMapper mapper) { this.mapper = mapper; }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException ex) throws IOException {
        response.setStatus(403);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getOutputStream(), ApiErrorResponse.of(ErrorCode.FORBIDDEN));
    }
}
