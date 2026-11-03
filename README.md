# SWD392 Group 6 — LMS

Frontend React chia theo module nghiệp vụ; backend Spring Boot chia theo layer (tầng).

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
│       │   │   ├── apiClient.js
│       │   │   └── ApiError.js
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
│   │   │   │   ├── common/
│   │   │   │   │   ├── http/            # ResponseBuilder, response và phân trang
│   │   │   │   │   └── exception/       # Mã lỗi và xử lý exception chung
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
│   ├── .env.example
│   ├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── .gitignore
└── README.md
```

Database: chạy `database/lms_g6_v4.sql` trước để tạo schema, rồi chạy `database/seed_enrollment_demo.sql` nếu cần dữ liệu demo enrollment. File schema reset toàn bộ `lms_g6`; sao lưu trước nếu cần giữ dữ liệu. Chi tiết: [database/README.md](database/README.md).
