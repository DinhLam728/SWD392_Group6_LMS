# SWD392 Group 6 — LMS

Frontend React chia theo module nghiệp vụ; backend Spring Boot chia theo layer (tầng), phù hợp với Package Diagram hiện tại.

```text
SWD392_Group6_LMS/
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── app/
│       │   ├── auth/                  # Trạng thái đăng nhập toàn ứng dụng
│       │   ├── layouts/               # Bố cục chung
│       │   ├── pages/                 # Trang chung: Home, NotFound, Forbidden
│       │   └── router/                # Routes và bảo vệ route
│       ├── shared/
│       │   ├── api/                   # API client dùng chung
│       │   ├── components/            # UI dùng chung
│       │   ├── hooks/
│       │   ├── utils/
│       │   ├── constants/
│       │   ├── assets/
│       │   └── styles/
│       └── modules/
│           ├── auth/                  # Đăng nhập, đăng ký, OTP, reset mật khẩu
│           │   ├── pages/
│           │   ├── components/
│           │   └── services/
│           ├── course/                # Khóa học, module học, bài học
│           │   ├── pages/
│           │   ├── components/
│           │   └── services/
│           ├── questionbank/          # Ngân hàng câu hỏi và tạo câu hỏi AI
│           │   ├── pages/
│           │   ├── components/
│           │   └── services/
│           ├── enrollment/            # Đăng ký khóa học và lịch sử đăng ký
│           │   ├── pages/
│           │   ├── components/
│           │   └── services/
│           ├── payment/               # QR và trạng thái thanh toán
│           │   ├── pages/
│           │   ├── components/
│           │   └── services/
│           └── quiz/                  # Tạo quiz, làm bài và xem kết quả
│               ├── pages/
│               ├── components/
│               └── services/
├── backend/
│   ├── .mvn/
│   │   └── wrapper/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/fu/se/lms_group6/
│   │   │   │   ├── BackendApplication.java
│   │   │   │   ├── controller/         # Nhận request, gọi service, trả response
│   │   │   │   ├── service/            # Nghiệp vụ và transaction
│   │   │   │   ├── repository/         # Truy cập database
│   │   │   │   ├── entity/             # Entity JPA của toàn ứng dụng
│   │   │   │   ├── dto/                # Request và response theo chức năng
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── course/
│   │   │   │   │   ├── questionbank/
│   │   │   │   │   ├── enrollment/
│   │   │   │   │   ├── payment/
│   │   │   │   │   └── quiz/
│   │   │   │   ├── security/           # Xác thực, phân quyền và cấu hình security
│   │   │   │   └── externalclient/     # Kết nối dịch vụ bên ngoài
│   │   │   │       ├── google/
│   │   │   │       ├── email/
│   │   │   │       ├── gemini/
│   │   │   │       └── sepay/
│   │   │   └── resources/
│   │   │       └── application.yaml
│   │   └── test/java/fu/se/lms_group6/
│   │       └── BackendApplicationTests.java
│   ├── .env.example
│   ├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── .gitignore
└── README.md
```

Các thư mục trên là khung triển khai; thư mục rỗng không được Git lưu. FE gọi BE qua REST API. File `.env` chứa cấu hình local và không được push; dùng `.env.example` làm mẫu.

BE đặt class theo tầng: ví dụ `controller/CourseController`, `service/CourseService`, `repository/CourseRepository`, `entity/Course`, `dto/course`. Mỗi entity được định nghĩa một lần để các chức năng sử dụng chung. Controller gọi service; service xử lý nghiệp vụ và gọi repository hoặc external client.
