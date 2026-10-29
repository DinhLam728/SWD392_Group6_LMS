# SWD392 Group 6 — Learning Management System

Project LMS của nhóm 6 môn SWD392. Repository chứa frontend React và backend Spring Boot.

Kiến trúc được thống nhất: backend chia package theo tầng như Package Diagram; frontend chia theo module nghiệp vụ với ba nhóm `app`, `modules`, `shared`. Hai ứng dụng giao tiếp qua REST API và không cần có cấu trúc thư mục giống nhau.

Project hiện có màn hình LMS tạm và cấu hình kết nối MySQL. Cấu trúc dưới đây là khung triển khai đã chọn; các controller, service, entity, router và tích hợp bên ngoài sẽ được bổ sung theo tiến độ chức năng.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite 8, JavaScript, ESLint |
| Backend | Java 21, Spring Boot 4.1.2, Maven |
| Data access | Spring Data JPA, MySQL |
| Dependency nền tảng BE | Spring Security, Validation, Lombok |
| Tích hợp dự kiến | Google Login, email OTP, Gemini API, SePay |

Các thư viện và cấu hình tích hợp bên ngoài sẽ được bổ sung khi thực hiện chức năng tương ứng.

## Kiến trúc dự án

Repository chứa một ứng dụng React và một ứng dụng Spring Boot. Backend được build bằng một project Maven, các tầng cùng chạy trong ứng dụng Spring Boot. MySQL lưu dữ liệu và chỉ được truy cập từ backend.

```text
Trình duyệt — React
  app/router + app/layouts + app/auth
                   |
  modules/<chức năng>/pages + components
                   |
  modules/<chức năng>/services
                   |
  shared/api
                   |
                   | HTTP / REST, request và response JSON
                   v
Spring Boot
  security → controller → service → repository → MySQL
                |            |           |
               dto          dto        entity (JPA)
                             |
                       externalclient
                             |
               Google / Email / Gemini / SePay
```

Sơ đồ thể hiện cách các thành phần phối hợp khi triển khai. Webhook thanh toán đi từ SePay vào endpoint backend, được xác minh trước khi service cập nhật trạng thái giao dịch và đăng ký khóa học.

### Backend chia theo tầng

Các class được đặt theo trách nhiệm kỹ thuật: `controller`, `service`, `repository`, `entity`, `dto`, `security`, `externalclient`. Một chức năng có code ở nhiều tầng; ví dụ quản lý khóa học có CourseController, CourseService, CourseRepository, Course và DTO tương ứng. Cách tổ chức này giữ các package cấp cao nhất khớp Package Diagram hiện tại.

### Frontend chia theo module

- `app`: điều phối toàn ứng dụng, gồm router, layout và trạng thái đăng nhập.
- `modules`: màn hình, component và hàm gọi API của từng nghiệp vụ.
- `shared`: API client, UI, hook, asset, style và tiện ích được nhiều module sử dụng.

Ví dụ một chức năng xuyên suốt hai ứng dụng:

```text
FE: modules/course/pages → modules/course/services → shared/api
                                      |
                                   REST API
                                      |
BE: controller/CourseController → service/CourseService
                                      |
                          repository/CourseRepository
                                      |
                               entity/Course → MySQL
```

Các tên class trên minh họa vị trí code sẽ được viết. FE gom code theo chức năng để quản lý giao diện; BE gom theo tầng để quản lý trách nhiệm xử lý. Cấu trúc hai bên được kết nối bằng hợp đồng API.

### Quy ước phối hợp FE và BE

Trước khi thực hiện một chức năng, thành viên phụ trách thống nhất HTTP method, URL endpoint, request/response DTO, phân trang, định dạng lỗi và quyền truy cập. Khi thay đổi hợp đồng API, cập nhật cả hàm gọi API ở FE và phần xử lý tương ứng ở BE.

- FE gọi backend qua `modules/<chức năng>/services` và API client chung ở `shared/api`.
- BE chịu trách nhiệm kiểm tra dữ liệu, xác thực, phân quyền, nghiệp vụ và transaction. Kiểm tra hoặc ẩn nút trên FE chỉ hỗ trợ trải nghiệm người dùng.
- FE nhận dữ liệu qua response DTO. Thông tin đăng nhập database và API key của nhà cung cấp được giữ ở backend.
- Mỗi entity dùng chung được định nghĩa một lần. Tái sử dụng service và external client chung thay vì tạo các bản sao theo thành viên.
- Mỗi thành viên có thể triển khai một chức năng xuyên suốt FE và BE theo bảng phân chia công việc bên dưới.

## Cấu trúc repository

```text
SWD392_Group6_LMS/
├── backend/
│   ├── .mvn/
│   ├── src/main/java/fu/se/lms_group6/
│   ├── src/main/resources/application.yaml
│   ├── src/test/java/fu/se/lms_group6/
│   ├── .env.example
│   ├── .gitignore
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   └── package.json
├── .gitignore
└── README.md
```

Các thư mục chưa có code chỉ tồn tại trên máy local vì Git không lưu thư mục rỗng. Khi clone repository, tạo các thư mục cần dùng theo cấu trúc dưới đây; Git sẽ lưu chúng khi có file code bên trong.

## Backend

Package gốc: `fu.se.lms_group6`. Backend tổ chức theo tầng như Package Diagram hiện tại; mỗi chức năng có các class tương ứng ở controller, service, repository, entity và dto.

```text
fu/se/lms_group6/
├── BackendApplication.java
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
│   ├── auth/
│   ├── course/
│   ├── questionbank/
│   ├── enrollment/
│   ├── payment/
│   └── quiz/
├── security/
└── externalclient/
    ├── google/
    ├── email/
    ├── gemini/
    └── sepay/
```

### Trách nhiệm các package

| Package | Trách nhiệm |
| --- | --- |
| `controller` | Nhận HTTP request, kiểm tra dữ liệu qua Validation, gọi service và trả response. |
| `service` | Quy tắc nghiệp vụ, transaction và phối hợp repository, service khác hoặc external client. |
| `repository` | Truy cập database bằng Spring Data JPA. |
| `entity` | Toàn bộ entity JPA, ví dụ User, Course, CourseModule, Lesson, Question, Registration, Payment, Quiz, QuizAttempt và AttemptAnswer khi triển khai. |
| `dto` | Request/response DTO, chia thư mục con theo chức năng: auth, course, questionbank, enrollment, payment, quiz. |
| `security` | Cấu hình Spring Security, CORS liên quan security, JWT, phân quyền và người dùng hiện tại. |
| `externalclient` | Giao tiếp với Google, email, Gemini và SePay; cấu hình kết nối và xử lý dữ liệu của nhà cung cấp. |

Luồng xử lý chính: `Security → Controller → Service → Repository → MySQL`. Service giao tiếp với nhà cung cấp qua `externalclient`.

Ví dụ khi triển khai chức năng course:

```text
controller/CourseController.java
service/CourseService.java
repository/CourseRepository.java
entity/Course.java
dto/course/CreateCourseRequest.java
dto/course/CourseResponse.java
```

Đây là ví dụ vị trí file, chưa phải các class đã được tạo.

Quy tắc khi triển khai:

- Mỗi entity được định nghĩa một lần trong `entity`; các chức năng sử dụng lại entity dùng chung.
- Controller gọi service, không truy cập repository trực tiếp. Các service phối hợp với nhau khi cần áp dụng nghiệp vụ của chức năng khác.
- Không trả trực tiếp entity chứa dữ liệu nhạy cảm ra API; dùng response DTO phù hợp.
- Gemini client dùng chung; prompt và xử lý nghiệp vụ thuộc service tương ứng.
- Không tạo class rỗng chỉ để lấp đầy thư mục. Khi cần thêm package chung như exception hoặc cấu hình ngoài security, nhóm thống nhất và cập nhật tài liệu.
- Test nằm trong `src/test/java/fu/se/lms_group6`, theo package của code được kiểm tra.

## Frontend

Frontend chia thành `app`, `modules` và `shared`.

```text
src/
├── App.jsx
├── main.jsx
├── app/
│   ├── auth/
│   ├── layouts/
│   ├── pages/
│   └── router/
├── modules/
│   ├── auth/
│   ├── course/
│   ├── questionbank/
│   ├── enrollment/
│   ├── payment/
│   └── quiz/
└── shared/
    ├── api/
    ├── assets/
    ├── components/
    ├── constants/
    ├── hooks/
    ├── styles/
    └── utils/
```

### Trách nhiệm các thư mục

| Thư mục | Trách nhiệm |
| --- | --- |
| `app/auth` | AuthProvider, trạng thái phiên đăng nhập và thông tin tài khoản cho toàn ứng dụng. |
| `app/layouts` | Bố cục chung, bố cục Student/Teacher, header và sidebar. |
| `app/pages` | Trang chung của ứng dụng như Home, NotFound, Forbidden. |
| `app/router` | Khai báo route, route yêu cầu đăng nhập và kiểm tra quyền. |
| `modules/auth` | Màn hình, component và API đăng nhập, đăng ký, OTP, reset mật khẩu. |
| `modules/course` | Màn hình quản lý và hiển thị khóa học, module học, lesson. |
| `modules/questionbank` | Màn hình quản lý câu hỏi, đáp án và duyệt câu hỏi AI. |
| `modules/enrollment` | Đăng ký khóa học, danh sách đăng ký và kết quả đăng ký. |
| `modules/payment` | QR thanh toán và hiển thị trạng thái giao dịch. |
| `modules/quiz` | Tạo quiz, làm bài, nộp bài, chấm điểm và xem kết quả. |
| `shared/api` | API client chung: base URL, token, xử lý request/response. |
| `shared/assets` | Hình ảnh, icon, font dùng chung và được import từ code. |
| `shared/components` | UI dùng ở nhiều module như Button, Modal, Table. |
| `shared/constants` | Hằng số dùng chung. |
| `shared/hooks` | React hook dùng ở nhiều module. |
| `shared/styles` | CSS, theme và biến style chung. |
| `shared/utils` | Hàm tiện ích như định dạng ngày, tiền và dữ liệu hiển thị. |

Mỗi module FE có khung:

```text
modules/course/
├── pages/
├── components/
└── services/
```

- `pages`: các màn hình gắn với route.
- `components`: component chỉ phục vụ module đó.
- `services`: các hàm gọi API nghiệp vụ, dùng API client từ `shared/api`.
- Có thể bổ sung `hooks/`, `utils/`, `assets/` bên trong module khi cần.

Component chỉ dùng trong một module đặt tại module đó. Chuyển sang `shared` khi được dùng chung. Route được tập hợp tại `app/router`, còn màn hình nghiệp vụ nằm trong `modules`.

`app/auth` phục vụ phiên đăng nhập toàn ứng dụng; `modules/auth` phục vụ luồng và màn hình xác thực. Asset import dùng chung nằm ở `shared/assets`; file cần truy cập trực tiếp bằng URL có thể đặt tại `public`.

Hiện `App.jsx` giữ Fragment chứa component LMS tạm. Chưa cài router hoặc thư viện API/state management; các thư mục trên mới là khung để triển khai.

## Phân chia công việc

| Nhóm chức năng | Backend chính | Frontend chính |
| --- | --- | --- |
| Login System | Các class Auth/User ở các tầng, `dto/auth`, `security`, Google/email client | `modules/auth`, `app/auth` |
| Manage Courses | Các class Course/Module/Lesson ở các tầng, `dto/course` | `modules/course` |
| Manage Question Bank | Các class Question ở các tầng, `dto/questionbank` | `modules/questionbank` |
| Enroll Course with Payment | Các class Registration/Payment ở các tầng, `dto/enrollment`, `dto/payment`, SePay client | `modules/enrollment`, `modules/payment` |
| Practice Quiz | Các class Quiz/Attempt/Answer ở các tầng, `dto/quiz` | `modules/quiz` |

Các phần dùng chung như cấu hình security/CORS, response, API client, router, layout và Gemini client cần được thống nhất giữa các thành viên.

## Chạy project trên máy local

### Backend

Yêu cầu: JDK 21 và MySQL đang chạy. Khi mở cả repository trong IntelliJ, chọn `backend/pom.xml → Add as Maven Project` nếu IDE chưa nhận Maven và đặt Project SDK là Java 21.

1. Tạo database trên MySQL:

```sql
CREATE DATABASE IF NOT EXISTS lms_group6 CHARACTER SET utf8mb4;
```

2. Sao chép file mẫu và điền thông tin kết nối thực tế:

```powershell
Copy-Item backend/.env.example backend/.env
```

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_group6
DB_USERNAME=your-username
DB_PASSWORD=your-password
```

`application.yaml` import `.env` dưới dạng Java properties. Viết `KEY=value`, không dùng `export` và không bao giá trị bằng dấu nháy. Các đường dẫn import hỗ trợ chạy từ thư mục repository hoặc `backend`.

3. Chạy từ thư mục backend trên Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Trên Linux/macOS:

```sh
cd backend
./mvnw spring-boot:run
```

Hoặc chạy `BackendApplication` trong IntelliJ. Cổng mặc định: `8080`. Spring Security hiện dùng cấu hình mặc định; trang đăng nhập hoặc yêu cầu xác thực có thể xuất hiện trước khi nhóm cấu hình security riêng.

Build và test từ thư mục backend:

```powershell
.\mvnw.cmd verify
```

Test khởi tạo Spring context hiện dùng datasource trong cấu hình ứng dụng, vì vậy cần MySQL và thông tin kết nối hợp lệ.

### Frontend

Yêu cầu: Node.js 22.12+ thuộc nhánh 22 hoặc bản LTS mới hơn tương thích Vite 8, cùng npm.

```powershell
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite in ra terminal; cổng mặc định là `5173`.

Kiểm tra code và build:

```powershell
npm run lint
npm run build
```

## Git và cấu hình local

- `.gitignore` ở gốc: file IDE và hệ điều hành.
- `frontend/.gitignore`: dependencies, build, coverage, biến môi trường và log của FE.
- `backend/.gitignore`: target, cấu hình local, biến môi trường, log và file dump của JVM.
- Commit `.env.example` với giá trị mẫu. Thông tin kết nối thật nằm trong `.env` hoặc cấu hình local đã được ignore.
- Commit `package-lock.json`, `pom.xml` và Maven Wrapper để các thành viên dùng cấu hình build thống nhất.

## Các điểm thiết kế cần thống nhất

Cấu trúc thư mục chưa quyết định chi tiết schema hoặc quyền nghiệp vụ. Trước khi triển khai, nhóm cần thống nhất các điểm đang khác nhau trong tài liệu:

- Vai trò Student/Teacher so với các phần đang dùng Expert/Admin/Manager.
- Quiz thuộc Lesson hay Module.
- Payment là entity riêng hay thông tin gộp trong Registration.
- Phạm vi thanh toán SePay; các chỗ còn nhắc VNPay/PayOS cần chỉnh theo lựa chọn cuối cùng.
- Số bảng và quan hệ dữ liệu giữa entity diagram và database diagram.
- Cập nhật mô tả kiến trúc Express/Sequelize/EJS sang Spring Boot/JPA và frontend React; Package Diagram BE giữ cách chia theo tầng và cập nhật mô tả khi bổ sung package mới.
