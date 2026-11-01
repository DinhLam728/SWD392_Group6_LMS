# Hướng dẫn sử dụng API chung cho nhóm LMS

## Quy tắc bảo vệ code dùng chung

Các thành viên tái sử dụng code dùng chung bên dưới, không tự ý sửa để phục vụ riêng một chức năng:

- `backend/src/main/java/fu/se/lms_group6/common/**`: response, phân trang, mã lỗi và exception handler.
- `backend/src/main/java/fu/se/lms_group6/security/**`: cấu hình và handler bảo mật.
- `frontend/src/shared/api/**`: API client và cấu trúc lỗi FE.
- Các cấu hình ảnh hưởng chung: `backend/src/main/resources/application.yaml`, `backend/.env.example`, `frontend/.env.example`.

**Yêu cầu đối với AI:** trước khi chỉnh sửa, di chuyển, đổi tên hoặc xóa bất kỳ file nào trong phạm vi trên, phải giải thích thay đổi dự kiến, lý do và ảnh hưởng đến các chức năng khác; sau đó hỏi người đang giao việc và chờ họ xác nhận rõ ràng. Yêu cầu triển khai một chức năng không mặc nhiên cho phép sửa code dùng chung. Nếu chưa được xác nhận, giữ nguyên phần chung và tiếp tục những việc không phụ thuộc thay đổi đó.

Quy tắc này áp dụng cả khi muốn bổ sung mã nghiệp vụ vào `ErrorCode`. Việc đổi contract response, cơ chế xác thực hoặc CORS cần được người phụ trách thống nhất với nhóm. Không tạo bản sao của các helper để lách quy tắc; nếu phần chung chưa đáp ứng thì nêu vấn đề và đề xuất trước.

Đây là quy ước làm việc, không phải cơ chế khóa file tự động. Khi dùng AI, thành viên cần yêu cầu AI đọc tài liệu này trước khi triển khai.

## 1. Cần nhớ khi viết một chức năng

- Controller nhận request, gọi service và trả kết quả bằng ResponseBuilder.
- Service xử lý nghiệp vụ, gọi repository và ném exception khi có lỗi.
- GlobalExceptionHandler nhận exception và chuyển thành JSON; không viết try/catch lặp lại ở controller.
- FE gọi API qua apiClient, nhận response.data hoặc bắt ApiError.

Nếu quen Node.js: controller gần với route handler; GlobalExceptionHandler gần với error middleware. DTO là cấu trúc dữ liệu gửi/nhận, entity là mô hình lưu database.

### Quy ước viết code khi triển khai chức năng mới

| Phần | Quy ước |
| --- | --- |
| Controller | Chỉ nhận request, validation đầu vào, gọi service và trả response bằng ResponseBuilder; không chứa nghiệp vụ hoặc gọi repository trực tiếp. |
| Service | Dùng constructor injection; tên hàm thể hiện nghiệp vụ; kiểm tra lỗi sớm để tránh if lồng nhiều tầng. |
| Service interface | Dùng interface XxxService trong service/ và class XxxServiceImpl trong service/impl/. Controller phụ thuộc interface; implementation có @Service, chứa nghiệp vụ và transaction khi cần. |
| DTO | Tách request/response, ưu tiên record; không trả entity trực tiếp. Chỉ đưa các field được phép công khai vào response. |
| Mapping | Chuyển Entity sang DTO tại một nơi rõ ràng trong phần nghiệp vụ, tái sử dụng khi cần; chưa thêm thư viện mapping. |
| Repository | Chứa truy vấn; thực hiện lọc, sắp xếp và phân trang ở database khi phù hợp, tránh lấy toàn bộ bảng rồi lọc trong Java. |
| Đặt tên | Dùng tên có ý nghĩa như course, registration, courseResponse; tránh obj, tmp, data1. |
| Imports và định dạng | Import cụ thể, không dùng wildcard trong code nghiệp vụ mới; dùng ngoặc {} cho các nhánh điều kiện và vòng lặp. Java dùng 4 dấu cách, JavaScript dùng 2 dấu cách; giữ định dạng nhất quán. |
| Comment | Giải thích lý do hoặc quy tắc khó hiểu; không chú thích lại từng dòng code hoặc thêm comment hình thức. |
| Frontend | Page/component gọi service của module; service dùng API client chung. Không cấu hình fetch lặp lại trong page/component. |

Ví dụ vị trí file BE khi triển khai Course:

```text
controller/CourseController.java
service/CourseService.java
service/impl/CourseServiceImpl.java
repository/CourseRepository.java
entity/Course.java
dto/course/CreateCourseRequest.java
dto/course/CourseResponse.java
```

Các quy ước trên áp dụng cho chức năng mới. Giữ nguyên code nền tảng common và API client hiện tại; không tự refactor chúng chỉ để đổi phong cách. Các đoạn import wildcard minh họa trong hướng dẫn chỉ để viết ngắn; code mới cần import từng lớp cụ thể.

### Prompt để thành viên sử dụng với AI

```text
Đọc docs/API_COMMON.md, README.md, database/lms_g6_quiz_random.sql
và code chung hiện có trước khi triển khai.

Chức năng cần làm: [mô tả chức năng, quyền truy cập và quy tắc nghiệp vụ].

Tuân thủ quy ước code trong hướng dẫn. BE chia theo layer, dùng interface
XxxService và class XxxServiceImpl; FE chia theo module. Tái sử dụng
ResponseBuilder, exception, phân trang và API client có sẵn.

Không tự đổi schema, cơ chế security hoặc contract response chung.
Không tự tạo lại các helper đã có. Nếu yêu cầu còn thiếu hoặc database
chưa đáp ứng thì hỏi trước khi triển khai.

Không tự sửa, di chuyển, đổi tên hoặc xóa code dùng chung trong phạm vi
được bảo vệ ở đầu tài liệu, kể cả thêm ErrorCode. Nếu cần thay đổi,
giải thích lý do và ảnh hưởng, hỏi tôi và chờ xác nhận rõ ràng trước khi sửa.

Sau khi hoàn thành, kiểm tra build/lint và các hành vi nghiệp vụ đã thay đổi;
báo rõ phần đã kiểm tra và phần chưa kiểm tra.
```

Với AI không có quyền truy cập repository, cần đính kèm các file liên quan; chỉ nhắc tên file không bảo đảm AI đọc được nội dung.

## 2. File dùng chung nằm ở đâu

Bên dưới `backend/src/main/java/fu/se/lms_group6/`:

```text
common/
├── http/
│   ├── ApiResponse.java
│   ├── ApiErrorResponse.java
│   ├── FieldViolation.java
│   ├── ResponseBuilder.java
│   ├── PageResponse.java
│   └── PageRequestFactory.java
└── exception/
    ├── ErrorCode.java
    ├── BusinessException.java
    ├── BadRequestException.java
    ├── NotFoundException.java
    ├── ConflictException.java
    └── GlobalExceptionHandler.java
```

Code mới import từ `fu.se.lms_group6.common.http` và `fu.se.lms_group6.common.exception`. Không dùng đường dẫn cũ `dto.common` hoặc `fu.se.lms_group6.exception`.

## 3. Controller trả thành công

```java
import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import org.springframework.http.ResponseEntity;

// HTTP 200, message mặc định "Thành công"
return ResponseBuilder.ok(responseDto);

// HTTP 200, message tùy chọn
return ResponseBuilder.ok(responseDto, "Lấy thông tin khóa học thành công");

// HTTP 201, message mặc định "Tạo mới thành công"
return ResponseBuilder.created(responseDto);

// HTTP 201, message tùy chọn
return ResponseBuilder.created(responseDto, "Tạo khóa học thành công");

// HTTP 204, không có body
return ResponseBuilder.noContent();
```

Hàm trả dữ liệu có kiểu `ResponseEntity<ApiResponse<CourseResponse>>`; hàm xóa không trả dữ liệu dùng `ResponseEntity<Void>`. CourseResponse là DTO do người phụ trách chức năng tạo, không phải entity.

Ví dụ phương thức trong CourseController sau khi đã có service và DTO:

```java
@GetMapping("/{courseId}")
public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable Long courseId) {
    return ResponseBuilder.ok(courseService.getCourse(courseId));
}
```

JSON thành công:

```json
{"code":"SUCCESS","message":"Thành công","data":{"id":1}}
```

Không thêm success/status/errorCode số hoặc tự tạo response khác trong từng chức năng. HTTP status nằm ở response HTTP. Webhook thanh toán và tải file có thể dùng định dạng riêng theo yêu cầu nhà cung cấp.

## 4. Service báo lỗi

```java
import fu.se.lms_group6.common.exception.*;

throw new NotFoundException();     // 404, NOT_FOUND
throw new BadRequestException();   // 400, INVALID_REQUEST
throw new ConflictException();     // 409, CONFLICT

// Khi cần mã lỗi chung khác, ví dụ lỗi quyền nghiệp vụ:
throw new BusinessException(ErrorCode.FORBIDDEN);
```

Ví dụ trong service, sau khi có CourseRepository:

```java
var course = courseRepository.findById(courseId)
        .orElseThrow(NotFoundException::new);
```

Không bắt exception ngay sau khi ném, không trả response HTTP trong service. Để lỗi đi lên GlobalExceptionHandler. Lỗi bất ngờ trả 500 với message an toàn và log chi tiết ở server.

Các subclass chỉ nhận ErrorCode có status tương ứng: NotFound=404, BadRequest=400, Conflict=409. Truyền sai sẽ bị phát hiện bằng IllegalArgumentException, đây là lỗi lập trình cần sửa.

### Thêm mã lỗi nghiệp vụ

Thêm vào enum ErrorCode, ví dụ:

```java
COURSE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"),
REGISTRATION_ALREADY_EXISTS(HttpStatus.CONFLICT, "Bạn đã đăng ký khóa học này"),
```

Sau khi thêm enum mới có thể dùng:

```java
throw new NotFoundException(ErrorCode.COURSE_NOT_FOUND);
throw new ConflictException(ErrorCode.REGISTRATION_ALREADY_EXISTS);
```

Hai mã trên là ví dụ để bổ sung khi triển khai nghiệp vụ, chưa được tạo sẵn. Không đưa SQL, mật khẩu, token hoặc thông tin nội bộ vào message.

JSON lỗi:

```json
{"code":"NOT_FOUND","message":"Không tìm thấy tài nguyên","errors":[]}
```

## 5. Validation request

```java
public record CreateCourseRequest(
    @NotBlank(message = "Tên khóa học không được để trống")
    @Size(max = 150, message = "Tên khóa học tối đa 150 ký tự")
    String title
) {}
```

Dùng annotation từ `jakarta.validation.constraints` trên DTO; controller nhận `@Valid @RequestBody CreateCourseRequest request`. Không tự trả lỗi validation ở controller.

```json
{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","errors":[{"field":"title","message":"Tên khóa học không được để trống"}]}
```

Validation DTO kiểm tra định dạng, giá trị và độ dài. Kiểm tra trùng dữ liệu, quyền sở hữu, liên kết Course/Quiz và trạng thái thuộc service/security. Constraint database vẫn cần để bảo vệ khi nhiều request chạy đồng thời; không chuyển mọi lỗi database thành 409.

## 6. Phân trang

Request ví dụ: `GET /api/v1/courses?page=0&size=10&sort=title,asc`.

- page bắt đầu từ 0; controller đặt mặc định 0.
- size mặc định 10, chỉ cho phép 1–100.
- sort tùy chọn, dạng field,asc hoặc field,desc.
- Mỗi endpoint có whitelist thuộc tính entity được phép sort.

```java
var pageable = PageRequestFactory.create(page, size, sort, Set.of("title", "courseId"));
var result = courseRepository.findAll(pageable).map(courseMapper::toResponse);
return ResponseBuilder.ok(PageResponse.from(result));
```

CourseRepository, courseMapper và tên thuộc tính là ví dụ; thay bằng code thực tế của chức năng. Không mặc định mọi entity có id hoặc createdAt.

```json
{"code":"SUCCESS","message":"Thành công","data":{"items":[],"page":0,"size":10,"totalElements":0,"totalPages":0}}
```

## 7. Frontend gọi và nhận lỗi

Ví dụ trong `frontend/src/modules/course/services/courseService.js`:

```javascript
import { apiClient } from '../../../shared/api/apiClient.js'

export function getCourses(page = 0) {
  return apiClient('courses', { query: { page, size: 10 } })
}

export function createCourse(requestDto, headers) {
  return apiClient('courses', { method: 'POST', body: requestDto, headers })
}
```

Ví dụ trong page, sau khi import service và ApiError:

```javascript
try {
  const response = await getCourses(0)
  setCourses(response.data.items)
} catch (error) {
  if (error instanceof ApiError) {
    setMessage(error.message)
    setFieldErrors(error.errors)
  } else {
    throw error
  }
}
```

Các setter là ví dụ state của page. ApiError import từ `shared/api/ApiError.js` bằng đường dẫn tương đối phù hợp vị trí file.

- Thành công trả nguyên envelope, đọc response.data; 204 trả null.
- Lỗi có status, code, message, errors. Dựa status/code để xử lý logic, không so sánh message.
- errors luôn là danh sách field/message, có thể có nhiều lỗi cho cùng một field.
- Lỗi mạng có status=0, code=NETWORK_ERROR. AbortError giữ nguyên để phân biệt hủy request.
- Client hiện dùng cho JSON; upload FormData và tải file dùng luồng riêng.
- Client không tự lưu token, refresh hoặc redirect khi 401.

## 8. Cấu hình và giới hạn hiện tại

- FE dùng `VITE_API_BASE_URL`, mặc định `http://localhost:8080/api/v1`; tham khảo frontend/.env.example và khởi động lại Vite khi sửa .env.
- BE vẫn yêu cầu xác thực HTTP Basic với user mặc định của Spring Boot; chưa có JWT/đăng nhập bằng bảng users.
- CSRF còn bật. Các method ghi dữ liệu cần token hợp lệ; phần nền tảng này chưa cung cấp luồng cấp token/đăng nhập. ResponseBuilder không bỏ qua security.
- CORS mặc định cho phép http://localhost:5173, có thể cấu hình CORS_ALLOWED_ORIGINS phân cách bằng dấu phẩy. Chưa bật CORS credentials.
- Không tắt CSRF hoặc mở toàn bộ endpoint để gọi thử; thống nhất auth trước khi nối chức năng đăng nhập FE/BE.
- HTTP 401/403 từ security trả JSON. Preflight bị CORS từ chối có thể không trả JSON và trình duyệt báo lỗi mạng.
- Không thêm UUID BaseEntity hoặc audit timestamp: database hiện dùng BIGINT AUTO_INCREMENT và chưa có các cột audit chung.

## 9. Database và SQL

Lần gom package và thêm helper/exception này không đổi schema hoặc dữ liệu, nên không cần chạy lại SQL chỉ vì thay đổi code này.

Database vẫn là `lms_g6`, passing_score/score theo thang 0–10, điểm đạt mặc định 5.00. Bản SQL hiện có là `database/lms_g6_quiz_random.sql`; file này tạo lại database và xóa toàn bộ dữ liệu lms_g6. Chỉ dùng khi muốn tạo lại database, không dùng như migration giữ dữ liệu.

## 10. Chạy kiểm tra

Từ thư mục repository:

```powershell
mvn -f backend/pom.xml -DskipTests package
cd frontend
npm run lint
npm run build
```

Lệnh Maven trên build backend và bỏ qua chạy test. BackendApplicationTests có sẵn vẫn được giữ; muốn chạy test đó cần database và cấu hình local hợp lệ. Các ví dụ Course trong hướng dẫn là mẫu cách dùng, không có nghĩa endpoint Course đã triển khai.
