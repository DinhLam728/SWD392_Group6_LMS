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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.controller.CurrentTeacher;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.common.http.PageRequestFactory;
import fu.se.lms_group6.common.http.PageResponse;
import fu.se.lms_group6.dto.questionbank.BatchSaveQuestionsRequest;
import fu.se.lms_group6.dto.questionbank.CreateQuestionRequest;
import fu.se.lms_group6.dto.questionbank.GenerateQuestionsAiRequest;
import fu.se.lms_group6.dto.questionbank.GeneratedQuestionItemDto;
import fu.se.lms_group6.dto.questionbank.ModuleOptionResponse;
import fu.se.lms_group6.dto.questionbank.QuestionBankStatsDto;
import fu.se.lms_group6.dto.questionbank.QuestionOptionDto;
import fu.se.lms_group6.dto.questionbank.QuestionResponse;
import fu.se.lms_group6.dto.questionbank.UpdateQuestionRequest;
import fu.se.lms_group6.entity.Course;
import fu.se.lms_group6.entity.CourseModule;
import fu.se.lms_group6.entity.enums.QuizStatus;
import fu.se.lms_group6.entity.Question;
import fu.se.lms_group6.entity.Quiz;
import fu.se.lms_group6.externalclient.gemini.GeminiClient;
import fu.se.lms_group6.repository.CourseModuleRepository;
import fu.se.lms_group6.repository.CourseRepository;
import fu.se.lms_group6.repository.QuestionRepository;
import fu.se.lms_group6.repository.QuizRepository;
import fu.se.lms_group6.service.QuestionBankService;

@Service
@Transactional
public class QuestionBankServiceImpl implements QuestionBankService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("questionId", "content", "questionType");

    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final CurrentTeacher currentTeacher;

    public QuestionBankServiceImpl(
            QuestionRepository questionRepository,
            CourseRepository courseRepository,
            QuizRepository quizRepository,
            CourseModuleRepository courseModuleRepository,
            GeminiClient geminiClient,
            CurrentTeacher currentTeacher,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.courseRepository = courseRepository;
        this.quizRepository = quizRepository;
        this.courseModuleRepository = courseModuleRepository;
        this.geminiClient = geminiClient;
        this.currentTeacher = currentTeacher;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<QuestionResponse> getQuestions(
            Long courseId,
            Long moduleId,
            Boolean assignedOnly,
            Boolean unassignedOnly,
            String topic,
            String difficulty,
            String keyword,
            int page,
            int size,
            String sort) {
        ownCourse(courseId);

        boolean onlyUnassigned = Boolean.TRUE.equals(unassignedOnly);
        String searchKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String topicFilter = (topic != null && !topic.isBlank() && !"ALL".equalsIgnoreCase(topic)) ? topic.trim()
                : null;
        String difficultyFilter = (difficulty != null && !difficulty.isBlank() && !"ALL".equalsIgnoreCase(difficulty))
                ? difficulty.trim()
                : null;

        PageRequest pageable = PageRequestFactory.create(page, size, sort, ALLOWED_SORT_FIELDS);
        Page<Question> questionPage = questionRepository.searchQuestions(
                courseId,
                moduleId,
                Boolean.TRUE.equals(assignedOnly),
                onlyUnassigned,
                topicFilter,
                difficultyFilter,
                searchKeyword,
                pageable);

        return PageResponse.from(questionPage.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBankStatsDto getQuestionBankStats(Long courseId) {
        ownCourse(courseId);

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
                reserve);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(NotFoundException::new);
        ownCourse(question.getCourse().getCourseId());
        return toResponse(question);
    }

    @Override
    public QuestionResponse createQuestion(CreateQuestionRequest request) {
        Course course = ownCourse(request.courseId());

        Quiz quiz = request.moduleId() == null ? null : moduleQuiz(request.moduleId(), course);

        String optionsJson = buildOptionsJson(
                request.options(),
                request.topic(),
                request.difficulty(),
                request.explanation());

        Question question = Question.builder()
                .course(course)
                .quiz(quiz)
                .content(request.content().trim())
                .questionType(request.questionType().trim())
                .optionsJson(optionsJson)
                .correctAnswer(normalizeAnswer(request.correctAnswer()))
                .build();

        Question saved = questionRepository.save(question);
        return toResponse(saved);
    }

    @Override
    public QuestionResponse updateQuestion(Long questionId, UpdateQuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(NotFoundException::new);
        Course course = ownCourse(question.getCourse().getCourseId());

        Quiz quiz = request.moduleId() == null ? null : moduleQuiz(request.moduleId(), course);

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
        question.setCorrectAnswer(normalizeAnswer(request.correctAnswer()));

        Question updated = questionRepository.save(question);
        return toResponse(updated);
    }

    @Override
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(NotFoundException::new);
        ownCourse(question.getCourse().getCourseId());
        if (question.getQuiz() != null) {
            throw new BusinessException(ErrorCode.QUESTION_ALREADY_ASSIGNED);
        }
        questionRepository.delete(question);
    }

    @Override
    public void bulkDeleteQuestions(List<Long> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            return;
        }
        List<Question> questions = ownQuestions(questionIds);
        for (Question q : questions) {
            if (q.getQuiz() != null) {
                throw new BusinessException(ErrorCode.QUESTION_ALREADY_ASSIGNED);
            }
        }
        questionRepository.deleteAll(questions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleOptionResponse> getCourseModules(Long courseId) {
        ownCourse(courseId);
        return courseModuleRepository.findByCourseCourseIdOrderByPositionAsc(courseId).stream()
                .map(module -> new ModuleOptionResponse(module.getModuleId(), module.getTitle()))
                .toList();
    }

    @Override
    public void bulkAssignModule(List<Long> questionIds, Long moduleId) {
        if (questionIds == null || questionIds.isEmpty()) {
            return;
        }
        List<Question> questions = ownQuestions(questionIds);
        Course course = questions.get(0).getCourse();
        Quiz quiz = moduleId == null ? null : moduleQuiz(moduleId, course);
        for (Question q : questions) {
            if (!q.getCourse().getCourseId().equals(course.getCourseId())) {
                throw new BadRequestException();
            }
            q.setQuiz(quiz);
        }
        questionRepository.saveAll(questions);
    }

    private Quiz moduleQuiz(Long moduleId, Course course) {
        CourseModule module = courseModuleRepository.findById(moduleId).orElseThrow(NotFoundException::new);
        if (!module.getCourse().getCourseId().equals(course.getCourseId())) {
            throw new BadRequestException();
        }
        return quizRepository
                .findFirstByModuleModuleIdAndCreatedByIsNullAndStatusOrderByQuizIdAsc(moduleId, QuizStatus.ACTIVE)
                .orElseGet(() -> {
                    Quiz quiz = new Quiz(module, "Ôn tập: " + module.getTitle());
                    quiz.setStatus(QuizStatus.ACTIVE);
                    return quizRepository.save(quiz);
                });
    }

    private List<Question> ownQuestions(List<Long> questionIds) {
        List<Question> questions = questionRepository.findAllById(questionIds);
        if (questions.size() != new java.util.HashSet<>(questionIds).size()) {
            throw new NotFoundException();
        }
        for (Question question : questions) {
            ownCourse(question.getCourse().getCourseId());
        }
        return questions;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GeneratedQuestionItemDto> generateQuestionsWithAi(GenerateQuestionsAiRequest request) {
        ownCourse(request.courseId());
        return geminiClient.generateQuestions(request);
    }

    @Override
    public List<QuestionResponse> batchSaveQuestions(BatchSaveQuestionsRequest request) {
        Course course = ownCourse(request.courseId());

        Quiz quiz = request.moduleId() == null ? null : moduleQuiz(request.moduleId(), course);

        List<QuestionResponse> responses = new ArrayList<>();
        for (CreateQuestionRequest item : request.questions()) {
            String optionsJson = buildOptionsJson(
                    item.options(),
                    item.topic(),
                    item.difficulty(),
                    item.explanation());

            Question question = Question.builder()
                    .course(course)
                    .quiz(quiz)
                    .content(item.content().trim())
                    .questionType(item.questionType().trim())
                    .optionsJson(optionsJson)
                    .correctAnswer(normalizeAnswer(item.correctAnswer()))
                    .build();

            Question saved = questionRepository.save(question);
            responses.add(toResponse(saved));
        }

        return responses;
    }

    private static String normalizeAnswer(String answer) {
        return java.util.Arrays.stream(answer.split(","))
                .map(key -> key.trim().toUpperCase(java.util.Locale.ROOT))
                .filter(key -> !key.isEmpty())
                .distinct()
                .sorted()
                .collect(java.util.stream.Collectors.joining(","));
    }

    private Course ownCourse(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(NotFoundException::new);
        if (!course.getTeacher().getUserId().equals(currentTeacher.requireId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return course;
    }

    private String buildOptionsJson(
            List<QuestionOptionDto> options,
            String topic,
            String difficulty,
            String explanation) {
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("options", options != null ? options : List.of());
            map.put("topic", (topic != null && !topic.isBlank()) ? topic.trim() : "General Topic");
            map.put("difficulty",
                    (difficulty != null && !difficulty.isBlank()) ? difficulty.trim().toUpperCase() : "MEDIUM");
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
            String explanation) {
    }

    private ExtractedQuestionMetadata parseOptionsJson(String json) {
        if (json == null || json.isBlank()) {
            return new ExtractedQuestionMetadata(List.of(), "General Topic", "MEDIUM", "");
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray()) {
                List<QuestionOptionDto> options = objectMapper.convertValue(
                        root,
                        new TypeReference<List<QuestionOptionDto>>() {
                        });
                return new ExtractedQuestionMetadata(options, "General Topic", "MEDIUM", "");
            } else if (root.isObject()) {
                List<QuestionOptionDto> options = List.of();
                if (root.has("options") && root.get("options").isArray()) {
                    options = objectMapper.convertValue(
                            root.get("options"),
                            new TypeReference<List<QuestionOptionDto>>() {
                            });
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
                question.getQuiz() != null ? question.getQuiz().getModule().getModuleId() : null,
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
