package fu.se.lms_group6.service.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.common.http.PageRequestFactory;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.questionbank.BatchSaveQuestionsRequest;
import fu.se.lms_group6.dto.questionbank.CreateQuestionRequest;
import fu.se.lms_group6.dto.questionbank.GenerateQuestionsAiRequest;
import fu.se.lms_group6.dto.questionbank.GeneratedQuestionItemDto;
import fu.se.lms_group6.dto.questionbank.QuestionBankStatsDto;
import fu.se.lms_group6.dto.questionbank.QuestionOptionDto;
import fu.se.lms_group6.dto.questionbank.QuestionResponse;
import fu.se.lms_group6.dto.questionbank.UpdateQuestionRequest;
import fu.se.lms_group6.entity.Course;
import fu.se.lms_group6.entity.Question;
import fu.se.lms_group6.entity.Quiz;
import fu.se.lms_group6.externalclient.gemini.GeminiClient;
import fu.se.lms_group6.repository.CourseRepository;
import fu.se.lms_group6.repository.QuestionRepository;
import fu.se.lms_group6.repository.QuizRepository;
import fu.se.lms_group6.service.QuestionBankService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class QuestionBankServiceImpl implements QuestionBankService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("questionId", "content", "questionType");

    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public QuestionBankServiceImpl(
            QuestionRepository questionRepository,
            CourseRepository courseRepository,
            QuizRepository quizRepository,
            GeminiClient geminiClient,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper
    ) {
        this.questionRepository = questionRepository;
        this.courseRepository = courseRepository;
        this.quizRepository = quizRepository;
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuestionResponse> getQuestions(
            Long courseId,
            Long quizId,
            Boolean unassignedOnly,
            String topic,
            String difficulty,
            String keyword,
            int page,
            int size,
            String sort
    ) {
        if (!courseRepository.existsById(courseId)) {
            throw new NotFoundException();
        }

        boolean onlyUnassigned = Boolean.TRUE.equals(unassignedOnly);
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String topicFilter = (topic != null && !topic.isBlank() && !"ALL".equalsIgnoreCase(topic)) ? topic.trim() : null;
        String difficultyFilter = (difficulty != null && !difficulty.isBlank() && !"ALL".equalsIgnoreCase(difficulty)) ? difficulty.trim() : null;

        PageRequest pageable = PageRequestFactory.create(page, size, sort, ALLOWED_SORT_FIELDS);
        Page<Question> questionPage = questionRepository.searchQuestions(
                courseId,
                quizId,
                onlyUnassigned,
                topicFilter,
                difficultyFilter,
                searchKeyword,
                pageable
        );

        return PageResponse.from(questionPage.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankStatsDto getQuestionBankStats(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new NotFoundException();
        }

        long total = questionRepository.countByCourse_CourseId(courseId);
        long easy = questionRepository.countByCourseIdAndDifficulty(courseId, "easy");
        long medium = questionRepository.countByCourseIdAndDifficulty(courseId, "medium");
        long hard = questionRepository.countByCourseIdAndDifficulty(courseId, "hard");
        long assigned = questionRepository.countByCourse_CourseIdAndQuizIsNotNull(courseId);
        long reserve = questionRepository.countByCourse_CourseIdAndQuizIsNull(courseId);

        if (total > 0 && (easy + medium + hard < total)) {
            medium += (total - (easy + medium + hard));
        }

        return new QuestionBankStatsDto(
                total,
                easy,
                medium,
                hard,
                assigned,
                reserve
        );
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(NotFoundException::new);
        return toResponse(question);
    }

    @Override
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(NotFoundException::new);

        Quiz quiz = null;
        if (request.quizId() != null) {
            quiz = quizRepository.findById(request.quizId())
                    .orElseThrow(NotFoundException::new);
        }

        String optionsJson = buildOptionsJson(
                request.options(),
                request.topic(),
                request.difficulty(),
                request.explanation()
        );

        Question question = Question.builder()
                .course(course)
                .quiz(quiz)
                .content(request.content().trim())
                .questionType(request.questionType().trim())
                .optionsJson(optionsJson)
                .correctAnswer(request.correctAnswer().trim())
                .build();

        Question saved = questionRepository.save(question);
        return toResponse(saved);
    }

    @Override
    public QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(NotFoundException::new);

        Quiz quiz = null;
        if (request.quizId() != null) {
            quiz = quizRepository.findById(request.quizId())
                    .orElseThrow(NotFoundException::new);
        }

        ExtractedQuestionMetadata existingMeta = parseOptionsJson(question.getOptionsJson());
        String topic = request.topic() != null ? request.topic().trim() : existingMeta.topic();
        String difficulty = request.difficulty() != null ? request.difficulty().trim() : existingMeta.difficulty();
        String explanation = request.explanation() != null ? request.explanation().trim() : existingMeta.explanation();
        List<QuestionOptionDto> options = request.options() != null ? request.options() : existingMeta.options();

        String optionsJson = buildOptionsJson(options, topic, difficulty, explanation);

        question.setQuiz(quiz);
        question.setContent(request.content().trim());
        question.setQuestionType(request.questionType().trim());
        question.setOptionsJson(optionsJson);
        question.setCorrectAnswer(request.correctAnswer().trim());

        Question updated = questionRepository.save(question);
        return toResponse(updated);
    }

    @Override
    public void deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new NotFoundException();
        }
        questionRepository.deleteById(questionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GeneratedQuestionItemDto> generateQuestionsWithAi(GenerateQuestionsAiRequest request) {
        if (!courseRepository.existsById(request.courseId())) {
            throw new NotFoundException();
        }
        return geminiClient.generateQuestions(request);
    }

    @Override
    public List<QuestionResponse> batchSaveQuestions(BatchSaveQuestionsRequest request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(NotFoundException::new);

        Quiz quiz = null;
        if (request.quizId() != null) {
            quiz = quizRepository.findById(request.quizId())
                    .orElseThrow(NotFoundException::new);
        }

        List<QuestionResponse> responses = new ArrayList<>();
        for (CreateQuestionRequest item : request.questions()) {
            String optionsJson = buildOptionsJson(
                    item.options(),
                    item.topic(),
                    item.difficulty(),
                    item.explanation()
            );

            Question question = Question.builder()
                    .course(course)
                    .quiz(quiz)
                    .content(item.content().trim())
                    .questionType(item.questionType().trim())
                    .optionsJson(optionsJson)
                    .correctAnswer(item.correctAnswer().trim())
                    .build();

            Question saved = questionRepository.save(question);
            responses.add(toResponse(saved));
        }

        return responses;
    }

    private String buildOptionsJson(
            List<QuestionOptionDto> options,
            String topic,
            String difficulty,
            String explanation
    ) {
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("options", options != null ? options : List.of());
            map.put("topic", (topic != null && !topic.isBlank()) ? topic.trim() : "General Topic");
            map.put("difficulty", (difficulty != null && !difficulty.isBlank()) ? difficulty.trim().toUpperCase() : "MEDIUM");
            map.put("explanation", explanation != null ? explanation.trim() : "");
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new BadRequestException();
        }
    }

    private record ExtractedQuestionMetadata(
            List<QuestionOptionDto> options,
            String topic,
            String difficulty,
            String explanation
    ) {}

    private ExtractedQuestionMetadata parseOptionsJson(String json) {
        if (json == null || json.isBlank()) {
            return new ExtractedQuestionMetadata(List.of(), "General Topic", "MEDIUM", "");
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray()) {
                List<QuestionOptionDto> options = objectMapper.convertValue(
                        root,
                        new TypeReference<List<QuestionOptionDto>>() {}
                );
                return new ExtractedQuestionMetadata(options, "General Topic", "MEDIUM", "");
            } else if (root.isObject()) {
                List<QuestionOptionDto> options = List.of();
                if (root.has("options") && root.get("options").isArray()) {
                    options = objectMapper.convertValue(
                            root.get("options"),
                            new TypeReference<List<QuestionOptionDto>>() {}
                    );
                }
                String topic = root.hasNonNull("topic") ? root.get("topic").asText() : "General Topic";
                String difficulty = root.hasNonNull("difficulty") ? root.get("difficulty").asText() : "MEDIUM";
                String explanation = root.hasNonNull("explanation") ? root.get("explanation").asText() : "";
                return new ExtractedQuestionMetadata(options, topic, difficulty, explanation);
            }
        } catch (Exception ignored) {
        }
        return new ExtractedQuestionMetadata(List.of(), "General Topic", "MEDIUM", "");
    }

    private QuestionResponse toResponse(Question question) {
        ExtractedQuestionMetadata meta = parseOptionsJson(question.getOptionsJson());
        return new QuestionResponse(
                question.getQuestionId(),
                question.getCourse() != null ? question.getCourse().getCourseId() : null,
                question.getCourse() != null ? question.getCourse().getTitle() : null,
                question.getQuiz() != null ? question.getQuiz().getQuizId() : null,
                question.getQuiz() != null ? question.getQuiz().getTitle() : null,
                meta.topic(),
                meta.difficulty(),
                question.getContent(),
                question.getQuestionType(),
                meta.options(),
                question.getCorrectAnswer(),
                meta.explanation()
        );
    }
}
