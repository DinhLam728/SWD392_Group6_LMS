package fu.se.lms_group6.dto.auth;

public record AuthResponse(
    String token,
    String tokenType,
    UserResponse user
) {
    public static AuthResponse of(String token, UserResponse user) {
        return new AuthResponse(token, "Bearer", user);
    }
}

