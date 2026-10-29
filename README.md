# SWD392 Group 6 — LMS

Frontend React chia theo module nghiệp vụ; backend Spring Boot chia package theo tầng.

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
│   │   │   │   ├── service/            # Xử lý nghiệp vụ và transaction
│   │   │   │   ├── repository/         # Truy cập database
│   │   │   │   ├── entity/             # Entity JPA dùng chung cho các chức năng
│   │   │   │   ├── dto/                # Dữ liệu request và response
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── course/
│   │   │   │   │   ├── questionbank/
│   │   │   │   │   ├── enrollment/
│   │   │   │   │   ├── payment/
│   │   │   │   │   └── quiz/
│   │   │   │   ├── security/           # Xác thực, phân quyền, JWT
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
└── README.md
```

Các thư mục trên là khung triển khai; thư mục rỗng không được Git lưu. FE gọi BE qua REST API. File `.env` chứa cấu hình local và không được push; dùng `.env.example` làm mẫu.
