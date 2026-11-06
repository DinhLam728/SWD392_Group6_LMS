package fu.se.lms_group6.externalclient.gemini;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class GeminiClientImpl implements LessonAiClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiClientImpl.class);

    private static final int MAX_LESSON_CHARS = 16_000; // lessons.content is TEXT (65,535 bytes), same limit as LessonRequest

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    // The key comes from the environment (or backend/.env); it is never in source code or in the URL.
    public GeminiClientImpl(
            ObjectMapper objectMapper,
            @Value("${GEMINI_API_KEY:}") String apiKey,
            @Value("${GEMINI_MODEL:gemini-2.5-flash}") String model,
            @Value("${GEMINI_TIMEOUT_SECONDS:30}") int timeoutSeconds) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public String generateLesson(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            // A missing key is a configuration error; never hand back made-up content.
            throw new AIException("GEMINI_API_KEY is not configured");
        }
        String requestBody = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("temperature", 0.7)));

        String rawResponse;
        try {
            rawResponse = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientException ex) {
            throw new AIException("Gemini request failed or timed out", ex);
        }

        if (rawResponse == null) {
            throw new AIException("Gemini answered with an empty body");
        }
        String content = cleanLessonText(extractText(rawResponse));
        if (content.isBlank()) {
            throw new AIException("Gemini returned an empty lesson");
        }
        return content;
    }

    private String extractText(String rawResponse) {
        JsonNode root;
        try {
            root = objectMapper.readTree(rawResponse);
        } catch (RuntimeException ex) {
            throw new AIException("Gemini answered with invalid JSON", ex);
        }
        JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
        StringBuilder text = new StringBuilder();
        for (int i = 0; i < parts.size(); i++) {
            String part = parts.get(i).path("text").textValue();
            if (part != null) {
                text.append(part);
            }
        }
        if (text.isEmpty()) {
            log.warn("Gemini answered without text, finishReason={}",
                    root.path("candidates").path(0).path("finishReason").textValue());
        }
        return text.toString();
    }

    private static String cleanLessonText(String text) {
        String cleaned = text
                .replaceAll("(?is)<(script|style|iframe)\\b.*?</\\1\\s*>", "")
                .replaceAll("[\\p{Cntrl}&&[^\\n\\t]]", "")
                .strip();
        if (cleaned.length() <= MAX_LESSON_CHARS) {
            return cleaned;
        }
        int end = MAX_LESSON_CHARS;
        // Do not cut a surrogate pair in half.
        if (Character.isHighSurrogate(cleaned.charAt(end - 1))) {
            end--;
        }
        return cleaned.substring(0, end).strip();
    }
}
