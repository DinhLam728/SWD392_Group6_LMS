package fu.se.lms_group6.security;

import fu.se.lms_group6.entity.User;
import fu.se.lms_group6.entity.enums.UserRole;
import fu.se.lms_group6.entity.enums.UserStatus;
import fu.se.lms_group6.repository.UserRepository;
import java.lang.reflect.Proxy;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class LoginEnrollmentIntegrationTest {
    private final JwtService jwt = new JwtService("integration-test-key-at-least-256-bits-long", 60000);
    private final User student = User.builder().userId(42L).email("student@example.test")
            .fullName("Student").role(UserRole.STUDENT).status(UserStatus.ACTIVE).build();
    private final UserRepository users = (UserRepository) Proxy.newProxyInstance(
            UserRepository.class.getClassLoader(), new Class<?>[]{UserRepository.class},
            (proxy, method, arguments) -> {
                if (method.getName().equals("findByEmail")) {
                    return student.getEmail().equals(arguments[0]) ? Optional.of(student) : Optional.empty();
                }
                throw new AssertionError("Unexpected repository call: " + method.getName());
            });

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginTokenResolvesEnrollmentStudent() throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + jwt.generateToken(42L, student.getEmail(), "STUDENT"));
        new JwtAuthenticationFilter(jwt).doFilter(request, new MockHttpServletResponse(), (req, res) -> {
            assertEquals(42L, new CurrentStudent(users).requireId());
            assertEquals("ROLE_STUDENT", SecurityContextHolder.getContext().getAuthentication()
                    .getAuthorities().iterator().next().getAuthority());
        });
    }

    @Test
    void invalidTokenDoesNotAuthenticate() throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid");
        new JwtAuthenticationFilter(jwt).doFilter(request, new MockHttpServletResponse(), (req, res) ->
                assertNull(new CurrentStudent(users).optionalId()));
    }

    @Test
    void demoHeaderDoesNotReplaceAuthenticatedLogin() throws Exception {
        var request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + jwt.generateToken(42L, student.getEmail(), "STUDENT"));
        request.addHeader("X-User-Id", "99");
        var response = new MockHttpServletResponse();
        new JwtAuthenticationFilter(jwt).doFilter(request, response, (req, res) ->
                new DemoStudentFilter(users, null).doFilter(req, res, (innerRequest, innerResponse) ->
                        assertEquals(42L, new CurrentStudent(users).requireId())));
    }
}
