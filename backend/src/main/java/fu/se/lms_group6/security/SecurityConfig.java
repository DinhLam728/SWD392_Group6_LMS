package fu.se.lms_group6.security;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
            RestAuthenticationEntryPoint entryPoint, RestAccessDeniedHandler deniedHandler) throws Exception {
        // Keep authentication required and CSRF protection until the auth flow is implemented.
        return http.cors(cors -> {})
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .httpBasic(basic -> basic.authenticationEntryPoint(entryPoint))
                .exceptionHandling(errors -> errors.authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(deniedHandler))
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") List<String> allowedOrigins) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(allowedOrigins);
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Accept", "Content-Type", "Authorization", "X-CSRF-TOKEN", "X-XSRF-TOKEN"));
        cors.setExposedHeaders(List.of("Location"));
        cors.setAllowCredentials(false);
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
