package fu.se.lms_group6.externalclient.gemini;

/** Raised when the Gemini call fails or its answer cannot be used. */
public class AIException extends RuntimeException {
    public AIException(String message) {
        super(message);
    }

    public AIException(String message, Throwable cause) {
        super(message, cause);
    }
}
