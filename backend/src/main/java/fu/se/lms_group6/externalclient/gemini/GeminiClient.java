package fu.se.lms_group6.externalclient.gemini;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import fu.se.lms_group6.dto.questionbank.GenerateQuestionsAiRequest;
import fu.se.lms_group6.dto.questionbank.GeneratedQuestionItemDto;
import fu.se.lms_group6.dto.questionbank.QuestionOptionDto;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * The only class that talks to Gemini. Lesson drafting (Manage Courses) and question generation
 * (Question Bank) both go through requestText, so the key, the model, the timeout and the error
 * handling live in one place.
 *
 * <p>The key is sent in the x-goog-api-key header and comes from GEMINI_API_KEY; it is never in
 * the URL or in source code. Every failure is reported as {@link AIException}.
 */
@Component
public class GeminiClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    // Google retires fixed model names (gemini-1.5-* and gemini-2.0-* no longer exist), so the default
    // is the alias that follows the current Flash model. Pin a name with GEMINI_MODEL if needed.
    private static final String DEFAULT_MODEL = "gemini-flash-latest";
    // lessons.content is TEXT (65,535 bytes); 16000 characters stay below it even at 4 bytes each.
    private static final int MAX_LESSON_CHARS = 16_000;
    private static final int LOG_BODY_CHARS = 500;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final Duration timeout;

    public GeminiClient(
            ObjectMapper objectMapper,
            @Value("${gemini.api-key:${GEMINI_API_KEY:}}") String apiKey,
            @Value("${gemini.model:${GEMINI_MODEL:" + DEFAULT_MODEL + "}}") String model,
            @Value("${GEMINI_TIMEOUT_SECONDS:120}") int timeoutSeconds) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.model = model == null || model.isBlank() ? DEFAULT_MODEL : model.trim();
        this.timeout = Duration.ofSeconds(Math.max(1, timeoutSeconds));
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    // ------------------------------------------------------------------ lesson drafting

    /**
     * Sends the prompt and returns plain lesson text, never longer than the lesson content limit.
     *
     * @throws AIException when the key is missing, the call fails or times out, or the answer is empty
     */
    public String generateLesson(String prompt) {
        String content = cleanLessonText(requestText(prompt, 0.7, false));
        if (content.isBlank()) {
            throw new AIException("Gemini returned an empty lesson");
        }
        return content;
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

    // ------------------------------------------------------------------ question generation

    /**
     * Question Bank behaviour is unchanged: without a key or when the call fails the simulated
     * generator answers instead, and an unreadable answer gives an empty list.
     */
    public List<GeneratedQuestionItemDto> generateQuestions(GenerateQuestionsAiRequest request) {
        int count = request.numberOfQuestions() != null ? request.numberOfQuestions() : 5;
        String difficulty = request.difficultyLevel() != null && !request.difficultyLevel().isBlank()
                ? request.difficultyLevel() : "MEDIUM";

        String text;
        try {
            text = requestText(buildQuestionPrompt(request.topic(), request.contextMaterial(), count, difficulty),
                    0.4, true);
        } catch (AIException ex) {
            log.warn("Gemini is unavailable ({}); falling back to the simulated question generator", ex.getMessage());
            return generateMockQuestions(request.topic(), count, difficulty);
        }
        return parseQuestions(text);
    }

    private String buildQuestionPrompt(String topic, String context, int count, String difficulty) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là một chuyên gia khảo thí và giáo dục. Hãy tạo đúng ").append(count)
                .append(" câu hỏi trắc nghiệm (MULTIPLE_CHOICE) về chủ đề: \"").append(topic).append("\".\n")
                .append("Độ khó: ").append(difficulty).append(".\n");

        if (context != null && !context.isBlank()) {
            sb.append("Tài liệu / ngữ cảnh tham khảo:\n").append(context).append("\n");
        }

        sb.append("Yêu cầu định dạng đầu ra BẮT BUỘC là một JSON Array hợp lệ, không chứa markdown, không chứa ```json hoặc văn bản nào khác ngoài JSON thô. Mỗi item có cấu trúc sau:\n")
                .append("[\n")
                .append("  {\n")
                .append("    \"content\": \"Nội dung câu hỏi?\",\n")
                .append("    \"questionType\": \"MULTIPLE_CHOICE\",\n")
                .append("    \"options\": [\n")
                .append("      {\"key\": \"A\", \"text\": \"Lựa chọn A\"},\n")
                .append("      {\"key\": \"B\", \"text\": \"Lựa chọn B\"},\n")
                .append("      {\"key\": \"C\", \"text\": \"Lựa chọn C\"},\n")
                .append("      {\"key\": \"D\", \"text\": \"Lựa chọn D\"}\n")
                .append("    ],\n")
                .append("    \"correctAnswer\": \"A\",\n")
                .append("    \"explanation\": \"Giải thích tại sao A là đáp án đúng\"\n")
                .append("  }\n")
                .append("]\n");

        return sb.toString();
    }

    private List<GeneratedQuestionItemDto> parseQuestions(String text) {
        String cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        }
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();
        if (cleaned.isEmpty()) {
            return List.of();
        }
        try {
            JsonNode root = objectMapper.readTree(cleaned);
            List<GeneratedQuestionItemDto> questions = new ArrayList<>();
            for (int i = 0; i < root.size(); i++) {
                JsonNode item = root.get(i);
                String content = item.path("content").textValue();
                if (content == null || content.isBlank()) {
                    continue;
                }
                List<QuestionOptionDto> options = new ArrayList<>();
                JsonNode optionNodes = item.path("options");
                for (int j = 0; j < optionNodes.size(); j++) {
                    String key = optionNodes.get(j).path("key").textValue();
                    String optionText = optionNodes.get(j).path("text").textValue();
                    if (key != null && optionText != null) {
                        options.add(new QuestionOptionDto(key, optionText));
                    }
                }
                String type = item.path("questionType").textValue();
                questions.add(new GeneratedQuestionItemDto(
                        content,
                        type == null || type.isBlank() ? "MULTIPLE_CHOICE" : type,
                        options,
                        item.path("correctAnswer").textValue(),
                        item.path("explanation").textValue()));
            }
            return questions;
        } catch (RuntimeException ex) {
            log.error("Failed to parse the Gemini question list", ex);
            return List.of();
        }
    }

    // ------------------------------------------------------------------ shared transport

    /** One call to generateContent; returns the concatenated text parts of the first candidate. */
    private String requestText(String prompt, double temperature, boolean jsonOutput) {
        if (apiKey.isEmpty()) {
            // A missing key is a configuration error; never hand back made-up content from here.
            throw new AIException("GEMINI_API_KEY is not configured");
        }
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", temperature);
        if (jsonOutput) {
            generationConfig.put("responseMimeType", "application/json");
        }
        String body = objectMapper.writeValueAsString(Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", generationConfig));

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + model + ":generateContent"))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .timeout(timeout)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new AIException("Gemini request was interrupted", ex);
        } catch (IOException ex) {
            throw new AIException("Gemini request failed or timed out", ex);
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String answer = response.body() == null ? "" : response.body();
            log.error("Gemini API returned HTTP {}: {}", response.statusCode(),
                    answer.length() > LOG_BODY_CHARS ? answer.substring(0, LOG_BODY_CHARS) : answer);
            throw new AIException("Gemini answered with HTTP " + response.statusCode());
        }
        return extractText(response.body());
    }

    private String extractText(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            throw new AIException("Gemini answered with an empty body");
        }
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

    private List<GeneratedQuestionItemDto> generateMockQuestions(String topic, int count, String difficulty) {
        List<GeneratedQuestionItemDto> list = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            List<QuestionOptionDto> options = List.of(
                    new QuestionOptionDto("A", "Định nghĩa / phương án chính xác thứ nhất liên quan đến " + topic),
                    new QuestionOptionDto("B", "Phương án đánh lạc hướng phổ biến về " + topic),
                    new QuestionOptionDto("C", "Khái niệm đối nghịch hoặc sai lệch về " + topic),
                    new QuestionOptionDto("D", "Không có phương án nào đúng trong số các phương án trên")
            );
            list.add(new GeneratedQuestionItemDto(
                    "Câu hỏi " + i + " [" + difficulty + "]: Khái niệm cốt lõi nào sau đây mô tả đúng nhất về " + topic + "?",
                    "MULTIPLE_CHOICE",
                    options,
                    "A",
                    "Phương án A là câu trả lời chuẩn xác dựa trên lý thuyết và tài liệu học tập của chủ đề " + topic
            ));
        }
        return list;
    }
}
