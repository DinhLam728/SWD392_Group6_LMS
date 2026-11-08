package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ConflictException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.dto.quiz.AiExplanationResponse;
import fu.se.lms_group6.dto.quiz.AttemptQuestionResponse;
import fu.se.lms_group6.dto.quiz.AttemptResponse;
import fu.se.lms_group6.dto.quiz.AttemptResultResponse;
import fu.se.lms_group6.dto.quiz.AttemptSummaryResponse;
import fu.se.lms_group6.dto.quiz.QuizInfoResponse;
import fu.se.lms_group6.dto.quiz.QuizOptionResponse;
import fu.se.lms_group6.dto.quiz.ResultQuestionResponse;
import fu.se.lms_group6.dto.quiz.SubmitAttemptRequest;
import fu.se.lms_group6.dto.quiz.SubmittedAnswerItem;
import fu.se.lms_group6.entity.AttemptAnswer;
import fu.se.lms_group6.entity.Question;
import fu.se.lms_group6.entity.Quiz;
import fu.se.lms_group6.entity.QuizAttempt;
import fu.se.lms_group6.entity.QuizConfig;
import fu.se.lms_group6.entity.Registration;
import fu.se.lms_group6.entity.enums.QuizAttemptStatus;
import fu.se.lms_group6.entity.enums.QuizStatus;
import fu.se.lms_group6.entity.enums.RegistrationStatus;
import fu.se.lms_group6.externalclient.gemini.GeminiClient;
import fu.se.lms_group6.dto.quiz.CreatePracticeQuizRequest;
import fu.se.lms_group6.dto.quiz.PracticeQuizSetupResponse;
import fu.se.lms_group6.entity.CourseModule;
import fu.se.lms_group6.repository.AttemptAnswerRepository;
import fu.se.lms_group6.repository.CourseModuleRepository;
import fu.se.lms_group6.repository.QuestionRepository;
import fu.se.lms_group6.repository.QuizAttemptRepository;
import fu.se.lms_group6.repository.QuizConfigRepository;
import fu.se.lms_group6.repository.QuizRepository;
import fu.se.lms_group6.repository.RegistrationRepository;
import fu.se.lms_group6.repository.UserRepository;
import fu.se.lms_group6.service.QuizService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class QuizServiceImpl implements QuizService {
    private static final Logger log = LoggerFactory.getLogger(QuizServiceImpl.class);

    // Giá trị mặc định khi quiz chưa có dòng quiz_configs (khớp DEFAULT trong schema).
    private static final int DEFAULT_DURATION_MINUTES = 30;
    private static final int DEFAULT_MAX_ATTEMPTS = 1;
    private static final BigDecimal DEFAULT_PASSING_SCORE = new BigDecimal("5.00");
    // Cho phép nộp trễ một chút để bù độ trễ mạng khi hết giờ.
    private static final Duration SUBMIT_GRACE = Duration.ofSeconds(60);
    private static final BigDecimal MAX_SCORE = BigDecimal.TEN;
    private static final int MAX_AI_TEXT_LENGTH = 3000;

    private final QuizRepository quizzes;
    private final QuizConfigRepository configs;
    private final QuestionRepository questions;
    private final QuizAttemptRepository attempts;
    private final AttemptAnswerRepository answers;
    private final RegistrationRepository registrations;
    private final UserRepository users;
    private final GeminiClient gemini;
    private final JsonMapper json;
    private final Clock clock;
    private final TransactionTemplate readOnlyTx;
    private final CourseModuleRepository modules;

    public QuizServiceImpl(QuizRepository quizzes, QuizConfigRepository configs, QuestionRepository questions,
            QuizAttemptRepository attempts, AttemptAnswerRepository answers, RegistrationRepository registrations,
            UserRepository users, GeminiClient gemini, JsonMapper json, Clock enrollmentClock,
            PlatformTransactionManager transactionManager, CourseModuleRepository modules) {
        this.modules = modules;
        this.quizzes = quizzes;
        this.configs = configs;
        this.questions = questions;
        this.attempts = attempts;
        this.answers = answers;
        this.registrations = registrations;
        this.users = users;
        this.gemini = gemini;
        this.json = json;
        this.clock = enrollmentClock;
        this.readOnlyTx = new TransactionTemplate(transactionManager);
        this.readOnlyTx.setReadOnly(true);
    }

    @Override
    @Transactional
    public PracticeQuizSetupResponse getPracticeQuizSetup(Long studentId, Long moduleId) {
        CourseModule module = requireEnrolledModule(studentId, moduleId);
        int available = questions.findByQuizModuleModuleIdAndQuizCreatedByIsNullOrderByQuestionIdAsc(moduleId).size();
        List<QuizInfoResponse> myQuizzes = quizzes
                .findByModuleModuleIdAndCreatedByUserIdAndStatusOrderByQuizIdDesc(moduleId, studentId, QuizStatus.ACTIVE)
                .stream().map(quiz -> getQuizInfo(studentId, quiz.getQuizId())).toList();
        return new PracticeQuizSetupResponse(module.getModuleId(), module.getTitle(),
                module.getCourse().getCourseId(), module.getCourse().getTitle(), available, myQuizzes);
    }

    @Override
    @Transactional
    public QuizInfoResponse createPracticeQuiz(Long studentId, Long moduleId, CreatePracticeQuizRequest request) {
        CourseModule module = requireEnrolledModule(studentId, moduleId);
        if (questions.findByQuizModuleModuleIdAndQuizCreatedByIsNullOrderByQuestionIdAsc(moduleId).isEmpty()) {
            throw new ConflictException(ErrorCode.QUIZ_HAS_NO_QUESTIONS);
        }
        String title = request.title() == null || request.title().isBlank()
                ? "Ôn tập " + module.getTitle() + " (" + request.questionCount() + " câu)"
                : request.title().trim();
        Quiz quiz = new Quiz(module, title.length() > 150 ? title.substring(0, 150) : title);
        quiz.setStatus(QuizStatus.ACTIVE);
        quiz.setCreatedBy(users.getReferenceById(studentId));
        quizzes.save(quiz);

        QuizConfig config = new QuizConfig(quiz);
        config.setQuestionCount(request.questionCount());
        config.setDurationMinutes(request.durationMinutes());
        config.setMaxAttempts(request.maxAttempts());
        config.setPassingScore(request.passingScore());
        config.setRandomQuestions(request.randomQuestions());
        config.setShuffleQuestions(request.shuffleQuestions());
        config.setShuffleOptions(request.shuffleOptions());
        configs.save(config);
        return getQuizInfo(studentId, quiz.getQuizId());
    }

    @Override
    @Transactional
    public QuizInfoResponse getQuizInfo(Long studentId, Long quizId) {
        Quiz quiz = requireActiveQuiz(studentId, quizId);
        Long courseId = quiz.getModule().getCourse().getCourseId();
        if (registrations.findFirstByStudentUserIdAndCourseCourseIdAndStatus(
                studentId, courseId, RegistrationStatus.ACTIVE).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_ENROLLED);
        }
        Settings settings = settingsOf(quiz);
        List<QuizAttempt> history = attempts.findByQuizQuizIdAndStudentUserIdOrderByAttemptIdAsc(quizId, studentId);
        LocalDateTime now = now();
        history.forEach(attempt -> closeIfExpired(attempt, settings, now));

        int poolSize = questionPool(quiz).size();
        int questionCount = settings.questionCount() == null ? poolSize : Math.min(poolSize, settings.questionCount());
        Long inProgressId = history.stream()
                .filter(attempt -> attempt.getStatus() == QuizAttemptStatus.IN_PROGRESS)
                .map(QuizAttempt::getAttemptId)
                .findFirst()
                .orElse(null);
        int used = history.size();
        int remaining = Math.max(0, settings.maxAttempts() - used);
        boolean canStart = inProgressId != null || (remaining > 0 && poolSize > 0);
        BigDecimal bestScore = history.stream()
                .filter(attempt -> attempt.getStatus() == QuizAttemptStatus.GRADED && attempt.getScore() != null)
                .map(QuizAttempt::getScore)
                .max(Comparator.naturalOrder())
                .orElse(null);

        List<AttemptSummaryResponse> summaries = new ArrayList<>();
        for (int i = 0; i < history.size(); i++) {
            summaries.add(toSummary(history.get(i), i + 1, settings));
        }
        return new QuizInfoResponse(quiz.getQuizId(), quiz.getTitle(), courseId,
                quiz.getModule().getCourse().getTitle(), quiz.getModule().getTitle(), questionCount,
                settings.durationMinutes(), settings.maxAttempts(), settings.passingScore(), used, remaining,
                inProgressId, canStart, bestScore, summaries);
    }

    @Override
    @Transactional
    public StartResult startAttempt(Long studentId, Long quizId) {
        Quiz quiz = requireActiveQuiz(studentId, quizId);
        Long courseId = quiz.getModule().getCourse().getCourseId();
        // Khóa các dòng đăng ký của sinh viên với khóa học để các request bắt đầu song song chạy tuần tự.
        List<Registration> studentRegistrations =
                registrations.findByStudentUserIdAndCourseCourseIdOrderByRegisteredAtDesc(studentId, courseId);
        boolean enrolled = studentRegistrations.stream()
                .anyMatch(registration -> registration.getStatus() == RegistrationStatus.ACTIVE);
        if (!enrolled) {
            throw new BusinessException(ErrorCode.NOT_ENROLLED);
        }

        Settings settings = settingsOf(quiz);
        LocalDateTime now = now();
        List<QuizAttempt> history = attempts.lockByQuizAndStudent(quizId, studentId);
        for (QuizAttempt attempt : history) {
            if (attempt.getStatus() == QuizAttemptStatus.IN_PROGRESS && !closeIfExpired(attempt, settings, now)) {
                // Đang có lượt làm dở còn hạn: cho làm tiếp, không tạo lượt mới.
                return new StartResult(toAttemptResponse(attempt, loadRows(attempt), settings, now), false);
            }
        }
        if (history.size() >= settings.maxAttempts()) {
            throw new ConflictException(ErrorCode.MAX_ATTEMPTS_REACHED);
        }
        List<Question> pool = questionPool(quiz);
        if (pool.isEmpty()) {
            throw new ConflictException(ErrorCode.QUIZ_HAS_NO_QUESTIONS);
        }

        QuizAttempt attempt = new QuizAttempt(quiz, users.getReferenceById(studentId));
        attempt.setStatus(QuizAttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(now);
        attempts.save(attempt);
        // Lưu theo đúng thứ tự hiển thị; answer_id tăng dần giữ thứ tự này khi tải lại.
        List<AttemptAnswer> rows = new ArrayList<>();
        for (Question question : selectQuestions(pool, settings)) {
            rows.add(answers.save(new AttemptAnswer(attempt, question)));
        }
        return new StartResult(toAttemptResponse(attempt, rows, settings, now), true);
    }

    @Override
    @Transactional
    public AttemptResponse getAttempt(Long studentId, Long attemptId) {
        QuizAttempt attempt = requireOwnedAttempt(studentId, attemptId);
        Settings settings = settingsOf(attempt.getQuiz());
        List<AttemptAnswer> rows = loadRows(attempt);
        LocalDateTime now = now();
        closeIfExpired(attempt, settings, now, rows);
        return toAttemptResponse(attempt, rows, settings, now);
    }

    @Override
    @Transactional(noRollbackFor = AttemptExpiredException.class)
    public AttemptResultResponse submitAttempt(Long studentId, Long attemptId, SubmitAttemptRequest request) {
        // Đọc có khóa là lần tải đầu tiên của lượt làm bài, nên trạng thái luôn là mới nhất.
        QuizAttempt attempt = attempts.lockByIdAndStudent(attemptId, studentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ATTEMPT_NOT_FOUND));
        if (attempt.getStatus() != QuizAttemptStatus.IN_PROGRESS) {
            throw new ConflictException(ErrorCode.ATTEMPT_ALREADY_SUBMITTED);
        }
        Settings settings = settingsOf(attempt.getQuiz());
        List<AttemptAnswer> rows = loadRows(attempt);
        LocalDateTime now = now();
        if (closeIfExpired(attempt, settings, now, rows)) {
            // Đã quá hạn + thời gian ân hạn: lượt làm được đóng với các câu chưa trả lời.
            throw new AttemptExpiredException();
        }

        Map<Long, AttemptAnswer> rowsByQuestion = new HashMap<>();
        rows.forEach(row -> rowsByQuestion.put(row.getQuestion().getQuestionId(), row));
        Set<Long> seen = new HashSet<>();
        for (SubmittedAnswerItem item : request.answers()) {
            if (!seen.add(item.questionId()) || !rowsByQuestion.containsKey(item.questionId())) {
                // Câu hỏi trùng hoặc không thuộc lượt làm bài này.
                throw new BadRequestException(ErrorCode.INVALID_REQUEST);
            }
        }
        for (SubmittedAnswerItem item : request.answers()) {
            rowsByQuestion.get(item.questionId()).setSubmittedAnswer(normalizeAnswer(item.selectedAnswer()));
        }
        grade(attempt, rows, now);
        return toResult(attempt, rows, settings);
    }

    @Override
    @Transactional
    public AttemptResultResponse getResult(Long studentId, Long attemptId) {
        QuizAttempt attempt = requireOwnedAttempt(studentId, attemptId);
        Settings settings = settingsOf(attempt.getQuiz());
        List<AttemptAnswer> rows = loadRows(attempt);
        closeIfExpired(attempt, settings, now(), rows);
        if (attempt.getStatus() != QuizAttemptStatus.GRADED) {
            throw new ConflictException(ErrorCode.ATTEMPT_NOT_GRADED);
        }
        return toResult(attempt, rows, settings);
    }

    @Override
    public AiExplanationResponse explainQuestion(Long studentId, Long attemptId, Long questionId) {
        // Đọc dữ liệu trong transaction ngắn, gọi Gemini bên ngoài để không giữ kết nối DB khi chờ AI.
        String prompt = readOnlyTx.execute(status -> {
            QuizAttempt attempt = requireOwnedAttempt(studentId, attemptId);
            if (attempt.getStatus() != QuizAttemptStatus.GRADED) {
                throw new ConflictException(ErrorCode.ATTEMPT_NOT_GRADED);
            }
            AttemptAnswer row = loadRows(attempt).stream()
                    .filter(answer -> answer.getQuestion().getQuestionId().equals(questionId))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND));
            return buildExplanationPrompt(row);
        });
        String text = gemini.generateText(prompt)
                .orElseThrow(() -> new BusinessException(ErrorCode.AI_SERVICE_UNAVAILABLE));
        if (text.length() > MAX_AI_TEXT_LENGTH) {
            text = text.substring(0, MAX_AI_TEXT_LENGTH);
        }
        return new AiExplanationResponse(questionId, text);
    }

    // ---- Kiểm tra điều kiện ----

    private Quiz requireActiveQuiz(Long studentId, Long quizId) {
        Quiz quiz = quizzes.findById(quizId).orElseThrow(() -> new NotFoundException(ErrorCode.QUIZ_NOT_FOUND));
        // Quiz ôn tập của sinh viên khác cũng trả 404.
        if (quiz.getCreatedBy() != null && !quiz.getCreatedBy().getUserId().equals(studentId)) {
            throw new NotFoundException(ErrorCode.QUIZ_NOT_FOUND);
        }
        if (quiz.getStatus() != QuizStatus.ACTIVE) {
            throw new ConflictException(ErrorCode.QUIZ_NOT_AVAILABLE);
        }
        return quiz;
    }

    private CourseModule requireEnrolledModule(Long studentId, Long moduleId) {
        CourseModule module = modules.findById(moduleId).orElseThrow(NotFoundException::new);
        if (registrations.findFirstByStudentUserIdAndCourseCourseIdAndStatus(
                studentId, module.getCourse().getCourseId(), RegistrationStatus.ACTIVE).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_ENROLLED);
        }
        return module;
    }

    // Quiz của giảng viên dùng câu hỏi đã gán vào nó; quiz sinh viên tự tạo dùng câu hỏi của module.
    private List<Question> questionPool(Quiz quiz) {
        return quiz.getCreatedBy() == null
                ? questions.findByQuizQuizIdOrderByQuestionIdAsc(quiz.getQuizId())
                : questions.findByQuizModuleModuleIdAndQuizCreatedByIsNullOrderByQuestionIdAsc(quiz.getModule().getModuleId());
    }

    private QuizAttempt requireOwnedAttempt(Long studentId, Long attemptId) {
        // Lượt làm của người khác cũng trả 404 để không lộ việc nó tồn tại.
        return attempts.findByAttemptIdAndStudentUserId(attemptId, studentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ATTEMPT_NOT_FOUND));
    }

    private Settings settingsOf(Quiz quiz) {
        Optional<QuizConfig> config = configs.findByQuizQuizId(quiz.getQuizId());
        if (config.isEmpty()) {
            return new Settings(DEFAULT_DURATION_MINUTES, DEFAULT_MAX_ATTEMPTS, DEFAULT_PASSING_SCORE,
                    null, false, false, false);
        }
        QuizConfig c = config.get();
        return new Settings(c.getDurationMinutes(), c.getMaxAttempts(), c.getPassingScore(), c.getQuestionCount(),
                Boolean.TRUE.equals(c.getRandomQuestions()), Boolean.TRUE.equals(c.getShuffleQuestions()),
                Boolean.TRUE.equals(c.getShuffleOptions()));
    }

    // ---- Tạo đề và chấm điểm ----

    private List<Question> selectQuestions(List<Question> pool, Settings settings) {
        Random random = ThreadLocalRandom.current();
        List<Question> chosen = new ArrayList<>(pool);
        Integer count = settings.questionCount();
        if (count != null && count < chosen.size()) {
            if (settings.randomQuestions()) {
                Collections.shuffle(chosen, random);
                chosen = new ArrayList<>(chosen.subList(0, count));
                chosen.sort(Comparator.comparing(Question::getQuestionId));
            } else {
                chosen = new ArrayList<>(chosen.subList(0, count));
            }
        }
        if (settings.shuffleQuestions()) {
            Collections.shuffle(chosen, random);
        }
        return chosen;
    }

    private void grade(QuizAttempt attempt, List<AttemptAnswer> rows, LocalDateTime submittedAt) {
        int correct = 0;
        for (AttemptAnswer row : rows) {
            String expected = row.getQuestion().getCorrectAnswer();
            boolean isCorrect = row.getSubmittedAnswer() != null && expected != null
                    && row.getSubmittedAnswer().equalsIgnoreCase(expected.trim());
            row.setIsCorrect(isCorrect);
            if (isCorrect) {
                correct++;
            }
        }
        BigDecimal score = rows.isEmpty() ? BigDecimal.ZERO.setScale(2)
                : MAX_SCORE.multiply(BigDecimal.valueOf(correct))
                        .divide(BigDecimal.valueOf(rows.size()), 2, RoundingMode.HALF_UP);
        attempt.setScore(score);
        attempt.setStatus(QuizAttemptStatus.GRADED);
        attempt.setSubmittedAt(submittedAt);
    }

    private boolean closeIfExpired(QuizAttempt attempt, Settings settings, LocalDateTime now) {
        if (!isExpired(attempt, settings, now)) {
            return false;
        }
        return closeIfExpired(attempt, settings, now, loadRows(attempt));
    }

    /** Đóng lượt làm quá hạn: chấm với các câu đã lưu (thường là chưa trả lời). */
    private boolean closeIfExpired(QuizAttempt attempt, Settings settings, LocalDateTime now, List<AttemptAnswer> rows) {
        if (!isExpired(attempt, settings, now)) {
            return false;
        }
        grade(attempt, rows, deadlineOf(attempt, settings));
        return true;
    }

    private boolean isExpired(QuizAttempt attempt, Settings settings, LocalDateTime now) {
        return attempt.getStatus() == QuizAttemptStatus.IN_PROGRESS
                && now.isAfter(deadlineOf(attempt, settings).plus(SUBMIT_GRACE));
    }

    private LocalDateTime deadlineOf(QuizAttempt attempt, Settings settings) {
        return attempt.getStartedAt().plusMinutes(settings.durationMinutes());
    }

    private static String normalizeAnswer(String selected) {
        if (selected == null || selected.isBlank()) {
            return null;
        }
        return selected.trim().toUpperCase(Locale.ROOT);
    }

    // ---- Chuyển đổi entity -> DTO ----

    private List<AttemptAnswer> loadRows(QuizAttempt attempt) {
        return answers.findByAttemptAttemptIdOrderByAnswerIdAsc(attempt.getAttemptId());
    }

    private AttemptResponse toAttemptResponse(QuizAttempt attempt, List<AttemptAnswer> rows, Settings settings,
            LocalDateTime now) {
        List<AttemptQuestionResponse> items = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            Question question = rows.get(i).getQuestion();
            List<QuizOptionResponse> options = parseQuestion(question).options();
            if (settings.shuffleOptions()) {
                options = shuffledOptions(options, attempt.getAttemptId(), question.getQuestionId());
            }
            items.add(new AttemptQuestionResponse(question.getQuestionId(), i + 1, question.getContent(), options));
        }
        Quiz quiz = attempt.getQuiz();
        return new AttemptResponse(attempt.getAttemptId(), quiz.getQuizId(), quiz.getTitle(),
                quiz.getModule().getCourse().getCourseId(), quiz.getModule().getCourse().getTitle(),
                attempt.getStatus().name(), settings.durationMinutes(),
                attempt.getStartedAt(), deadlineOf(attempt, settings), now, items);
    }

    private AttemptResultResponse toResult(QuizAttempt attempt, List<AttemptAnswer> rows, Settings settings) {
        List<ResultQuestionResponse> items = new ArrayList<>();
        int correct = 0;
        for (int i = 0; i < rows.size(); i++) {
            AttemptAnswer row = rows.get(i);
            Question question = row.getQuestion();
            ParsedQuestion parsed = parseQuestion(question);
            List<QuizOptionResponse> options = settings.shuffleOptions()
                    ? shuffledOptions(parsed.options(), attempt.getAttemptId(), question.getQuestionId())
                    : parsed.options();
            boolean isCorrect = Boolean.TRUE.equals(row.getIsCorrect());
            if (isCorrect) {
                correct++;
            }
            items.add(new ResultQuestionResponse(question.getQuestionId(), i + 1, question.getContent(), options,
                    row.getSubmittedAnswer(), question.getCorrectAnswer(), isCorrect, parsed.explanation()));
        }
        Quiz quiz = attempt.getQuiz();
        List<QuizAttempt> history = attempts.findByQuizQuizIdAndStudentUserIdOrderByAttemptIdAsc(
                quiz.getQuizId(), attempt.getStudent().getUserId());
        int attemptNumber = history.indexOf(attempt) + 1;
        return new AttemptResultResponse(attempt.getAttemptId(), attemptNumber, quiz.getQuizId(), quiz.getTitle(),
                quiz.getModule().getCourse().getCourseId(), quiz.getModule().getCourse().getTitle(),
                attempt.getStatus().name(), attempt.getScore(),
                settings.passingScore(), isPassed(attempt, settings), correct, rows.size(), attempt.getStartedAt(),
                attempt.getSubmittedAt(), items);
    }

    private AttemptSummaryResponse toSummary(QuizAttempt attempt, int number, Settings settings) {
        return new AttemptSummaryResponse(attempt.getAttemptId(), number, attempt.getStatus().name(),
                attempt.getScore(), isPassed(attempt, settings), attempt.getStartedAt(), attempt.getSubmittedAt());
    }

    private static Boolean isPassed(QuizAttempt attempt, Settings settings) {
        if (attempt.getStatus() != QuizAttemptStatus.GRADED || attempt.getScore() == null) {
            return null;
        }
        return attempt.getScore().compareTo(settings.passingScore()) >= 0;
    }

    /** Xáo phương án cố định theo lượt làm và câu hỏi, nên tải lại trang vẫn giữ thứ tự. */
    private static List<QuizOptionResponse> shuffledOptions(List<QuizOptionResponse> options, Long attemptId,
            Long questionId) {
        List<QuizOptionResponse> shuffled = new ArrayList<>(options);
        Collections.shuffle(shuffled, new Random(attemptId * 1_000_003L + questionId));
        return shuffled;
    }

    /** Đọc options_json theo định dạng của Question Bank: {"options":[{key,text}], "explanation": ...}. */
    private ParsedQuestion parseQuestion(Question question) {
        String raw = question.getOptionsJson();
        if (raw == null || raw.isBlank()) {
            return new ParsedQuestion(List.of(), "");
        }
        try {
            JsonNode root = json.readTree(raw);
            JsonNode optionNodes = root.isArray() ? root : root.path("options");
            List<QuizOptionResponse> options = new ArrayList<>();
            if (optionNodes.isArray()) {
                for (JsonNode node : optionNodes) {
                    options.add(new QuizOptionResponse(node.path("key").asString(""), node.path("text").asString("")));
                }
            }
            String explanation = root.isObject() ? root.path("explanation").asString("") : "";
            return new ParsedQuestion(options, explanation);
        } catch (RuntimeException ex) {
            log.warn("Cannot parse options_json of question {}", question.getQuestionId());
            return new ParsedQuestion(List.of(), "");
        }
    }

    private String buildExplanationPrompt(AttemptAnswer row) {
        Question question = row.getQuestion();
        ParsedQuestion parsed = parseQuestion(question);
        StringBuilder sb = new StringBuilder()
                .append("Bạn là trợ giảng của một khóa học trực tuyến. Hãy giải thích ngắn gọn bằng tiếng Việt ")
                .append("(tối đa 150 từ, văn bản thuần, không dùng markdown) vì sao đáp án đúng là đúng, ")
                .append("và nếu học viên chọn sai thì vì sao lựa chọn đó chưa đúng.\n\n")
                .append("Câu hỏi: ").append(question.getContent()).append('\n')
                .append("Các phương án:\n");
        parsed.options().forEach(option -> sb.append(option.key()).append(". ").append(option.text()).append('\n'));
        sb.append("Đáp án đúng: ").append(question.getCorrectAnswer()).append('\n')
                .append("Học viên chọn: ")
                .append(row.getSubmittedAnswer() == null ? "không trả lời" : row.getSubmittedAnswer()).append('\n');
        if (!parsed.explanation().isBlank()) {
            sb.append("Giải thích tham khảo của giảng viên: ").append(parsed.explanation()).append('\n');
        }
        return sb.toString();
    }

    private LocalDateTime now() {
        // Cột DATETIME không lưu phần lẻ giây; cắt trước để giá trị trong bộ nhớ khớp với DB.
        return LocalDateTime.now(clock).truncatedTo(ChronoUnit.SECONDS);
    }

    private record Settings(int durationMinutes, int maxAttempts, BigDecimal passingScore, Integer questionCount,
            boolean randomQuestions, boolean shuffleQuestions, boolean shuffleOptions) {}

    private record ParsedQuestion(List<QuizOptionResponse> options, String explanation) {}

    /** Hết giờ: transaction vẫn commit việc đóng lượt làm bài trước khi trả lỗi. */
    static class AttemptExpiredException extends ConflictException {
        AttemptExpiredException() {
            super(ErrorCode.ATTEMPT_EXPIRED);
        }
    }
}
