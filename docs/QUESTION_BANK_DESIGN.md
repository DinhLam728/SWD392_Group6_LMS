# Thiết kế Phân hệ Quản lý Ngân hàng câu hỏi (Manage Question Bank) - LMS Group 6

Tài liệu thiết kế và đặc tả kỹ thuật cho chức năng số 3: **Manage Question Bank** (External Entities: **Teacher**, **Gemini API**), tuân thủ hướng dẫn chuẩn hóa API trong `docs/API_COMMON.md` và lược đồ cơ sở dữ liệu `database/lms_g6_quiz_random.sql`.

---

## 1. Use Case Diagram (UC-03: Manage Question Bank)

```mermaid
flowchart LR
    Teacher((Giảng viên))
    GeminiAPI((Gemini API))

    subgraph LMS_System ["Hệ thống LMS (Question Bank Module)"]
        UC1["Xem danh sách câu hỏi ngân hàng"]
        UC2["Tìm kiếm & Lọc câu hỏi (theo Quiz/chưa gán)"]
        UC3["Thêm câu hỏi thủ công"]
        UC4["Chỉnh sửa câu hỏi"]
        UC5["Xóa câu hỏi"]
        UC6["Sinh câu hỏi tự động bằng AI"]
        UC7["Lưu hàng loạt câu hỏi AI vào ngân hàng"]
    end

    Teacher --> UC1
    Teacher --> UC2
    Teacher --> UC3
    Teacher --> UC4
    Teacher --> UC5
    Teacher --> UC6
    Teacher --> UC7

    UC6 -.->|<<include>>| GeminiAPI
```

---

## 2. Activity Diagram (External-Integrated: Sinh câu hỏi qua Gemini API)

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Step1[Giảng viên mở chức năng Tạo câu hỏi AI]
    Step1 --> Step2[Nhập chủ đề, tài liệu bài giảng, số lượng, độ khó]
    Step2 --> Step3[Hệ thống validate đầu vào DTO]
    Step3 -->|Dữ liệu không hợp lệ| Step2
    Step3 -->|Hợp lệ| Step4[Hệ thống đóng gói Prompt gửi tới Gemini API]
    Step4 --> Step5[Gemini API xử lý và sinh danh sách câu hỏi dạng JSON]
    Step5 --> Step6[Hệ thống parse JSON và hiển thị preview danh sách câu hỏi]
    Step6 --> Step7[Giảng viên xem xét, chọn lọc hoặc chỉnh sửa câu hỏi]
    Step7 --> Step8[Giảng viên nhấn Lưu vào Ngân hàng câu hỏi]
    Step8 --> Step9[Hệ thống lưu các câu hỏi vào Database và cập nhật giao diện]
    Step9 --> End([Kết thúc])
```

---

## 3. Class Diagram (Phân hệ Manage Question Bank)

```mermaid
classDiagram
    direction TB

    class QuestionBankController {
        -QuestionBankService questionBankService
        +getCourseQuestions(courseId, page, size, sort, quizId, unassignedOnly, keyword) ResponseEntity
        +getQuestionDetail(questionId) ResponseEntity
        +createQuestion(CreateQuestionRequest) ResponseEntity
        +updateQuestion(questionId, UpdateQuestionRequest) ResponseEntity
        +deleteQuestion(questionId) ResponseEntity
        +generateQuestionsAi(GenerateQuestionsAiRequest) ResponseEntity
        +batchSaveQuestions(BatchSaveQuestionsRequest) ResponseEntity
    }

    class QuestionBankService {
        <<interface>>
        +getQuestions(courseId, quizId, unassignedOnly, keyword, page, size, sort) PageResponse
        +getQuestionById(questionId) QuestionResponse
        +createQuestion(CreateQuestionRequest) QuestionResponse
        +updateQuestion(questionId, UpdateQuestionRequest) QuestionResponse
        +deleteQuestion(questionId) void
        +generateQuestionsWithAi(GenerateQuestionsAiRequest) List~GeneratedQuestionItemDto~
        +batchSaveQuestions(BatchSaveQuestionsRequest) List~QuestionResponse~
    }

    class QuestionBankServiceImpl {
        -QuestionRepository questionRepository
        -CourseRepository courseRepository
        -QuizRepository quizRepository
        -GeminiClient geminiClient
        -ObjectMapper objectMapper
    }

    class GeminiClient {
        -String apiKey
        -String model
        -ObjectMapper objectMapper
        -HttpClient httpClient
        +generateQuestions(GenerateQuestionsAiRequest) List~GeneratedQuestionItemDto~
    }

    class Question {
        -Long questionId
        -Course course
        -Quiz quiz
        -String content
        -String questionType
        -String optionsJson
        -String correctAnswer
    }

    class Course {
        -Long courseId
        -User teacher
        -String title
        -String description
        -BigDecimal price
        -Boolean isPublished
    }

    class Quiz {
        -Long quizId
        -Long moduleId
        -String title
        -String status
    }

    class QuestionRepository {
        <<interface>>
        +searchQuestions(courseId, quizId, unassignedOnly, keyword, pageable) Page~Question~
    }

    QuestionBankController --> QuestionBankService
    QuestionBankServiceImpl ..|> QuestionBankService
    QuestionBankServiceImpl --> QuestionRepository
    QuestionBankServiceImpl --> GeminiClient
    QuestionBankServiceImpl --> Question
    Question --> Course
    Question --> Quiz
```

---

## 4. Sequence Diagram (External-Integrated: Sinh câu hỏi qua Gemini API)

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Giảng viên
    participant FE as Frontend (React UI)
    participant Ctrl as QuestionBankController
    participant Svc as QuestionBankService
    participant Client as GeminiClient
    participant Gemini as Google Gemini API
    participant DB as MySQL Database

    Teacher->>FE: Nhập chủ đề, tài liệu, số câu và bấm "Tạo câu hỏi AI"
    FE->>Ctrl: POST /api/v1/question-bank/generate-ai (GenerateQuestionsAiRequest)
    Ctrl->>Svc: generateQuestionsWithAi(request)
    Svc->>Client: generateQuestions(request)
    Client->>Gemini: POST /models/gemini-1.5-flash:generateContent (Prompt JSON format)
    Gemini-->>Client: Trả về JSON chứa danh sách câu hỏi & đáp án
    Client-->>Svc: List<GeneratedQuestionItemDto>
    Svc-->>Ctrl: List<GeneratedQuestionItemDto>
    Ctrl-->>FE: 200 OK + ApiResponse<List<GeneratedQuestionItemDto>>
    FE-->>Teacher: Hiển thị giao diện xem trước (Preview & Checkbox lựa chọn)

    Teacher->>FE: Chọn các câu hỏi phù hợp và bấm "Lưu vào Ngân hàng"
    FE->>Ctrl: POST /api/v1/question-bank/batch-save (BatchSaveQuestionsRequest)
    Ctrl->>Svc: batchSaveQuestions(request)
    loop Lưu từng câu hỏi
        Svc->>DB: INSERT INTO questions (course_id, quiz_id, content, question_type, options_json, correct_answer)
    end
    DB-->>Svc: Xác nhận lưu thành công
    Svc-->>Ctrl: List<QuestionResponse>
    Ctrl-->>FE: 201 Created + ApiResponse<List<QuestionResponse>>
    FE-->>Teacher: Thông báo lưu thành công và tải lại danh sách ngân hàng câu hỏi
```

---

## 5. Đặc tả API Endpoints

| Method | Endpoint | Mô tả | Mã thành công |
|---|---|---|---|
| `GET` | `/api/v1/courses/{courseId}/questions` | Lấy danh sách câu hỏi (phân trang, lọc theo quiz, tìm kiếm keyword) | `200 OK` (PageResponse) |
| `GET` | `/api/v1/questions/{questionId}` | Lấy chi tiết một câu hỏi | `200 OK` |
| `POST` | `/api/v1/questions` | Tạo một câu hỏi mới thủ công | `201 Created` |
| `PUT` | `/api/v1/questions/{questionId}` | Cập nhật nội dung câu hỏi | `200 OK` |
| `DELETE`| `/api/v1/questions/{questionId}` | Xóa câu hỏi khỏi ngân hàng | `204 No Content` |
| `POST` | `/api/v1/question-bank/generate-ai` | Gọi Gemini API tự động sinh câu hỏi theo chủ đề | `200 OK` |
| `POST` | `/api/v1/question-bank/batch-save` | Lưu hàng loạt câu hỏi được duyệt từ AI vào ngân hàng | `201 Created` |


## Chạy sau khi tích hợp với enrollment

Mặc định ứng dụng dùng MySQL theo backend/.env, ddl-auto: none, schema database/lms_g6_v4.sql. Không tự seed khi startup.

Nếu cần giữ cách demo Question Bank bằng H2 và DataInitializer, bật profile questionbank-demo:

```powershell
mvn -f backend/pom.xml spring-boot:run "-Dspring-boot.run.profiles=questionbank-demo"
```

Profile này dùng database in-memory riêng, dữ liệu mất khi dừng ứng dụng. Không dùng H2 demo để kiểm tra giao dịch SePay Live. Menu Ngân hàng câu hỏi nằm cạnh Khóa học; các route /question-bank và /questions được giữ.
