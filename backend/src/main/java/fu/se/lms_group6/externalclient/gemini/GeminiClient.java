package fu.se.lms_group6.externalclient.gemini;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.lms_group6.dto.questionbank.GenerateQuestionsAiRequest;
import fu.se.lms_group6.dto.questionbank.GeneratedQuestionItemDto;
import fu.se.lms_group6.dto.questionbank.QuestionOptionDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GeminiClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiClient(
            @Value("${gemini.api-key:${GEMINI_API_KEY:}}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null && !model.isBlank() ? model.trim() : "gemini-1.5-flash";
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public List<GeneratedQuestionItemDto> generateQuestions(GenerateQuestionsAiRequest request) {
        int count = request.numberOfQuestions() != null ? request.numberOfQuestions() : 5;
        String difficulty = request.difficultyLevel() != null && !request.difficultyLevel().isBlank()
                ? request.difficultyLevel() : "MEDIUM";

        if (apiKey.isEmpty()) {
            log.warn("GEMINI_API_KEY is not configured. Falling back to local AI question generator simulator.");
            return generateMockQuestions(request.topic(), count, difficulty);
        }

        try {
            String prompt = buildPrompt(request.topic(), request.contextMaterial(), count, difficulty);
            String requestBody = buildGeminiRequestBody(prompt);

            HttpResponse<String> response = sendGenerateContent(requestBody);

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return parseGeminiResponse(response.body());
            } else {
                log.error("Gemini API returned error HTTP {}: {}", response.statusCode(), response.body());
                return generateMockQuestions(request.topic(), count, difficulty);
            }
        } catch (Exception ex) {
            log.error("Failed to call Gemini API, falling back to simulated question generator", ex);
            return generateMockQuestions(request.topic(), count, difficulty);
        }
    }

    /**
     * Sinh văn bản tự do từ prompt (ví dụ giải thích đáp án quiz).
     * Trả về rỗng khi chưa cấu hình API key, Gemini lỗi hoặc không có nội dung; không dùng dữ liệu giả.
     */
    public Optional<String> generateText(String prompt) {
        if (apiKey.isEmpty()) {
            log.warn("GEMINI_API_KEY is not configured. Text generation is unavailable.");
            return Optional.empty();
        }
        try {
            HttpResponse<String> response = sendGenerateContent(buildGeminiRequestBody(prompt, false));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.error("Gemini API returned error HTTP {} for text generation", response.statusCode());
                return Optional.empty();
            }
            JsonNode parts = objectMapper.readTree(response.body())
                    .path("candidates").path(0).path("content").path("parts");
            StringBuilder text = new StringBuilder();
            if (parts.isArray()) {
                parts.forEach(part -> text.append(part.path("text").asText("")));
            }
            String result = text.toString().trim();
            return result.isEmpty() ? Optional.empty() : Optional.of(result);
        } catch (Exception ex) {
            log.error("Failed to call Gemini API for text generation", ex);
            return Optional.empty();
        }
    }

    private HttpResponse<String> sendGenerateContent(String requestBody) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(45))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        return httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
    }

    private String buildPrompt(String topic, String context, int count, String difficulty) {
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

    private String buildGeminiRequestBody(String prompt) throws Exception {
        return buildGeminiRequestBody(prompt, true);
    }

    private String buildGeminiRequestBody(String prompt, boolean jsonOutput) throws Exception {
        var rootNode = objectMapper.createObjectNode();
        var contentsArray = rootNode.putArray("contents");
        var contentObj = contentsArray.addObject();
        var partsArray = contentObj.putArray("parts");
        partsArray.addObject().put("text", prompt);

        var configNode = rootNode.putObject("generationConfig");
        configNode.put("temperature", 0.4);
        if (jsonOutput) {
            configNode.put("responseMimeType", "application/json");
        }

        return objectMapper.writeValueAsString(rootNode);
    }

    private List<GeneratedQuestionItemDto> parseGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText();
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
                    return objectMapper.readValue(cleaned, new TypeReference<List<GeneratedQuestionItemDto>>() {});
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response payload: {}", responseJson, e);
        }
        return List.of();
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
