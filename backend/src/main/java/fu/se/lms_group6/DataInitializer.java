package fu.se.lms_group6;

import java.math.BigDecimal;
import fu.se.lms_group6.entity.Course;
import fu.se.lms_group6.entity.CourseModule;
import fu.se.lms_group6.entity.Question;
import fu.se.lms_group6.entity.Quiz;
import fu.se.lms_group6.entity.User;
import fu.se.lms_group6.entity.enums.QuizStatus;
import fu.se.lms_group6.entity.enums.UserRole;
import fu.se.lms_group6.entity.enums.UserStatus;
import fu.se.lms_group6.repository.CourseModuleRepository;
import fu.se.lms_group6.repository.CourseRepository;
import fu.se.lms_group6.repository.QuestionRepository;
import fu.se.lms_group6.repository.QuizRepository;
import fu.se.lms_group6.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public DataInitializer(
            UserRepository userRepository,
            CourseRepository courseRepository,
            CourseModuleRepository courseModuleRepository,
            QuizRepository quizRepository,
            QuestionRepository questionRepository
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseModuleRepository = courseModuleRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) {
        if (courseRepository.count() > 0) {
            return;
        }

        log.info("Initializing sample data for Database (Teacher, Course #1, Quiz #1 and Question Bank)...");

        User teacher = User.builder()
                .fullName("Prof. John Doe")
                .email("teacher@fpt.edu.vn")
                .role(UserRole.TEACHER)
                .status(UserStatus.ACTIVE)
                .build();
        teacher = userRepository.save(teacher);

        Course course = Course.builder()
                .teacher(teacher)
                .title("Object-Oriented Programming (Java) SWD392")
                .description("Intensive hands-on course covering OOP, Spring Boot REST MVC, and Spring Data JPA.")
                .price(BigDecimal.ZERO)
                .isPublished(true)
                .build();
        course = courseRepository.save(course);

        CourseModule module = new CourseModule(course, "Module 1: Foundations", 1);
        module = courseModuleRepository.save(module);

        Quiz quiz = Quiz.builder()
                .module(module)
                .title("Quiz 01: Core OOP Concepts")
                .status(QuizStatus.ACTIVE)
                .build();
        quiz = quizRepository.save(quiz);

        Question q1 = Question.builder()
                .course(course)
                .quiz(null)
                .content("In Java, which keyword is used by a subclass to inherit from a parent class?")
                .questionType("MULTIPLE_CHOICE")
                .optionsJson("""
                    {
                      "options": [
                        {"key":"A","text":"implements"},
                        {"key":"B","text":"extends"},
                        {"key":"C","text":"inherits"},
                        {"key":"D","text":"super"}
                      ],
                      "topic": "OOP Inheritance & Polymorphism",
                      "difficulty": "EASY",
                      "explanation": "The 'extends' keyword is used in a class declaration to specify the superclass to inherit from."
                    }
                    """.stripIndent())
                .correctAnswer("B")
                .build();

        Question q2 = Question.builder()
                .course(course)
                .quiz(quiz)
                .content("How is encapsulation typically achieved in Java Object-Oriented Programming?")
                .questionType("MULTIPLE_CHOICE")
                .optionsJson("""
                    {
                      "options": [
                        {"key":"A","text":"Declaring fields as private and providing public getter/setter methods"},
                        {"key":"B","text":"Declaring all fields and methods as public"},
                        {"key":"C","text":"Using the final keyword on all variable declarations"},
                        {"key":"D","text":"Inheriting from multiple parent classes simultaneously"}
                      ],
                      "topic": "Encapsulation & Abstraction",
                      "difficulty": "MEDIUM",
                      "explanation": "Encapsulation shields an object's internal state by hiding fields and exposing controlled accessors/mutators."
                    }
                    """.stripIndent())
                .correctAnswer("A")
                .build();

        Question q3 = Question.builder()
                .course(course)
                .quiz(null)
                .content("In Spring Boot MVC architecture, which annotation is used to designate a Controller that returns RESTful JSON responses?")
                .questionType("MULTIPLE_CHOICE")
                .optionsJson("""
                    {
                      "options": [
                        {"key":"A","text":"@Controller"},
                        {"key":"B","text":"@RestController"},
                        {"key":"C","text":"@Service"},
                        {"key":"D","text":"@Repository"}
                      ],
                      "topic": "Spring Boot REST MVC",
                      "difficulty": "EASY",
                      "explanation": "@RestController combines @Controller and @ResponseBody in Spring Boot."
                    }
                    """.stripIndent())
                .correctAnswer("B")
                .build();

        Question q4 = Question.builder()
                .course(course)
                .quiz(quiz)
                .content("Which interface in Spring Data JPA provides built-in CRUD operations such as findAll(), save(), and findById()?")
                .questionType("MULTIPLE_CHOICE")
                .optionsJson("""
                    {
                      "options": [
                        {"key":"A","text":"JpaRepository"},
                        {"key":"B","text":"JdbcTemplate"},
                        {"key":"C","text":"EntityInterface"},
                        {"key":"D","text":"DataMapping"}
                      ],
                      "topic": "Spring Data JPA & ORM",
                      "difficulty": "HARD",
                      "explanation": "JpaRepository extends PagingAndSortingRepository and CrudRepository to provide robust persistence helpers."
                    }
                    """.stripIndent())
                .correctAnswer("A")
                .build();

        Question q5 = Question.builder()
                .course(course)
                .quiz(null)
                .content("In Spring Boot, which annotation is combined with @RestControllerAdvice to intercept and handle a specific exception globally?")
                .questionType("MULTIPLE_CHOICE")
                .optionsJson("""
                    {
                      "options": [
                        {"key":"A","text":"@CatchException"},
                        {"key":"B","text":"@ExceptionHandler"},
                        {"key":"C","text":"@ErrorHandler"},
                        {"key":"D","text":"@HandleError"}
                      ],
                      "topic": "Exception Handling",
                      "difficulty": "HARD",
                      "explanation": "@ExceptionHandler marks handler methods for specific exception types within a RestControllerAdvice component."
                    }
                    """.stripIndent())
                .correctAnswer("B")
                .build();

        questionRepository.save(q1);
        questionRepository.save(q2);
        questionRepository.save(q3);
        questionRepository.save(q4);
        questionRepository.save(q5);

        log.info("Sample data initialized successfully: Course ID = {}, Initial Question Count = {}",
                course.getCourseId(), questionRepository.count());
    }
}
