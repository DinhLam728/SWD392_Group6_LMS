package fu.se.lms_group6.externalclient.google;

public record GoogleUserInfo(
    String sub,
    String email,
    String name,
    String picture,
    boolean emailVerified
) {}

