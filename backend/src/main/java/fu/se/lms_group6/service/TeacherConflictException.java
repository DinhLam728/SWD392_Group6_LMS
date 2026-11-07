package fu.se.lms_group6.service;

/**
 * A change refused because of the current state of the data (HTTP 409). The message says why, so
 * the Teacher sees "it still has 3 registrations" instead of a generic conflict text.
 */
public class TeacherConflictException extends RuntimeException {
    public TeacherConflictException(String message) {
        super(message);
    }
}
