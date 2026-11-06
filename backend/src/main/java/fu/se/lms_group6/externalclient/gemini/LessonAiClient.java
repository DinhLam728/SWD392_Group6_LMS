package fu.se.lms_group6.externalclient.gemini;

/**
 * Lesson drafting through Gemini. GeminiClient is already a concrete class of the question bank
 * feature, so this interface has its own name instead of reusing it.
 */
public interface LessonAiClient {

    /**
     * Sends the prompt and returns cleaned lesson text, never longer than the lesson content limit.
     *
     * @throws AIException when the key is missing, the call fails or times out, or the answer is empty or invalid
     */
    String generateLesson(String prompt);
}
