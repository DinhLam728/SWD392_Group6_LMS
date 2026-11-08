# SWD392 Group 6 — LMS

## Hướng dẫn chạy

### 1. Cài đặt
- Java 21 (JDK)
- Node.js 20 trở lên
- MySQL 8.0 trở lên

### 2. Tạo database và dữ liệu demo
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
- `schema.sql`: **xóa và tạo lại** database `lms_g6` với 10 bảng, chưa có dữ liệu.
- `seed.sql`: dữ liệu demo (18 khóa học, bài học, câu hỏi, tài khoản demo, ảnh khóa học).

### 3. Chạy backend (cổng 8080)
1. Mở `backend/.env`, sửa `DB_USERNAME` và `DB_PASSWORD` thành tài khoản MySQL của máy đang chạy.
2. Chạy:
```bash
cd backend
mvnw spring-boot:run
```
Trên macOS/Linux dùng `./mvnw spring-boot:run`. Có thể mở thư mục `backend` bằng IntelliJ và chạy `BackendApplication`.

### 4. Chạy frontend (cổng 5173)
```bash
cd frontend
npm install
npm run dev
```
Mở http://localhost:5173

### 5. Tài khoản demo
| Vai trò | Email | Mật khẩu | Ghi chú |
|---|---|---|---|
| Giảng viên | teacher.enrollment@example.test | Teacher@123 | Sở hữu 18 khóa học mẫu và ngân hàng câu hỏi |
| Giảng viên | teacher.test@example.test | Teacher@123 | Chưa có khóa học, dùng để thử tạo khóa học mới |
| Sinh viên | student.demo@example.test | Student@123 | Đã đăng ký và thanh toán khóa "Git và GitHub cho làm việc nhóm" |

Có thể đăng ký tài khoản mới (mã OTP gửi qua email) hoặc đăng nhập bằng Google.

### 6. Thử thanh toán SePay không cần chuyển tiền thật
1. Đăng nhập sinh viên, mở một khóa học chưa đăng ký, bấm **Đăng ký khóa học**.
2. Ở trang QR, ghi lại **nội dung chuyển khoản** (`LMS...`) và **số tiền**.
3. Mở terminal ở thư mục gốc project và chạy:
```bash
node scripts/simulate-sepay-payment.cjs <ma-LMS> <so-tien>
```
Ví dụ: `node scripts/simulate-sepay-payment.cjs LMS1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D 20000`

Trong vài giây, trang QR tự chuyển sang **Đăng ký thành công**.

### 7. Chức năng theo từng phần
| Chức năng | Tài khoản | Đường dẫn |
|---|---|---|
| Login (Email/Password, Google) | Bất kỳ | `/login` |
| Manage Courses (AI soạn bài bằng Gemini) | Giảng viên | Menu **Quản lý khóa học** |
| Manage Question Bank (AI sinh câu hỏi bằng Gemini) | Giảng viên | Menu **Ngân hàng câu hỏi** |
| Enroll Course with Payment (SePay) | Sinh viên | `/courses` → chọn khóa → Đăng ký |
| Create & Take Practice Quiz (AI giải thích bằng Gemini) | Sinh viên | Khóa đã đăng ký → module → **Quiz ôn tập của bạn** |

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

Database: import `database/schema.sql` rồi `database/seed.sql`.
