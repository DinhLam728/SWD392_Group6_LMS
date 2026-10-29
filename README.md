# SWD392 Group 6 — LMS

Frontend React và backend Spring Boot chia theo module nghiệp vụ. Bên trong mỗi module BE chia theo tầng controller, service, repository, entity và dto.

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
│   │   │   │   ├── auth/                # Đăng nhập, đăng ký, OTP, reset mật khẩu
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── user/                # Tài khoản dùng chung
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── course/              # Course, CourseModule, Lesson
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── questionbank/        # Câu hỏi và đáp án
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── enrollment/          # Đăng ký khóa học
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── payment/             # Giao dịch và webhook thanh toán
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── quiz/                # Quiz, lượt làm bài và kết quả
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   └── dto/
│   │   │   ├── common/                 # Thành phần dùng chung
│   │   │   │   ├── entity/             # Lớp nền nếu cần
│   │   │   │   ├── exception/          # Mã lỗi và xử lý exception
│   │   │   │   ├── http/               # Response và phân trang
│   │   │   │   └── utils/
│   │   │   ├── config/                 # Cấu hình ứng dụng
│   │   │   ├── security/               # Xác thực, phân quyền, JWT
│   │   │   └── externalclient/         # Kết nối dịch vụ bên ngoài
│   │   │       ├── google/
│   │   │       ├── email/
│   │   │       ├── gemini/
│   │   │       └── sepay/
│   │   └── resources/
│   │   │       └── application.yaml
│   │   └── test/java/fu/se/lms_group6/
│   │       └── BackendApplicationTests.java
│   ├── .env.example
│   ├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── .gitignore
└── README.md
```

Các thư mục trên là khung triển khai; thư mục rỗng không được Git lưu. FE gọi BE qua REST API. File `.env` chứa cấu hình local và không được push; dùng `.env.example` làm mẫu.

Entity nghiệp vụ nằm trong module sở hữu, ví dụ User ở `user/entity`, Course ở `course/entity`; `common/entity` chỉ chứa lớp nền dùng chung. Các module phối hợp qua service.
