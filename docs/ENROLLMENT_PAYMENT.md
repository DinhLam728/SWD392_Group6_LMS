# Enroll Course with Payment — hướng dẫn chạy và đọc code

## Phạm vi

5 màn hình: danh sách khóa học, chi tiết, QR SePay, kết quả và lịch sử đăng ký.
API đọc course là phần phụ thuộc tối thiểu. Chưa có CRUD course,
JWT/login, My Learning hoặc hoàn tiền tự động.

## Quy tắc nghiệp vụ

- Chỉ sinh viên ACTIVE được đăng ký khóa học đã publish. Số tiền lấy từ BE, là số nguyên VND dương.
- Mỗi lần đăng ký chụp lại giá, tạo mã LMS + 32 ký tự hex và hạn thanh toán 24 giờ.
- PENDING còn hạn: mở lại cùng đăng ký/QR. ACTIVE: không tạo thêm. Hết hạn: tạo bản mới, giữ lịch sử.
- Mốc thời gian dùng giờ Việt Nam, lưu DATETIME đến giây. Giao dịch phải từ registeredAt (bao gồm) đến expiresAt (không bao gồm).
- Webhook đến muộn vẫn hợp lệ nếu thời điểm giao dịch nằm trong hạn và số tiền/tài khoản khớp.
- Nếu chưa có đăng ký ACTIVE: kích hoạt đăng ký nhận thanh toán và chuyển các đăng ký PENDING khác cùng sinh viên/khóa học sang EXPIRED.
- Nếu đã có đăng ký ACTIVE: giữ quyền học đó. Đăng ký nhận khoản tiền hợp lệ khác được ghi paymentStatus=SUCCESS nhưng status=EXPIRED, không cấp quyền học lần hai.
- EXPIRED ở module này bao gồm hết hạn hoặc đóng do một đăng ký khác đã kích hoạt. FE dùng activeRegistrationId để giải thích và dẫn về đăng ký đang hoạt động.
- Không thể ngăn ngân hàng nhận khoản chuyển thứ hai từ QR đã lưu. Hệ thống chỉ ngăn tạo quyền học trùng; không tự hoàn tiền.
- transaction_ref lưu SEPAY:<id webhook>, không phải referenceCode của ngân hàng. Unique bảo vệ một giao dịch không xác nhận hai đăng ký.
- Callback trùng không đổi kết quả. Mỗi đăng ký lưu một giao dịch thành công; khoản chuyển thêm vào cùng đăng ký đã SUCCESS chỉ được ghi log.
- Sai mã/tài khoản/số tiền, tiền ra hoặc giao dịch ngoài hạn: không kích hoạt, không tự đánh dấu FAILED; ghi log ở BE.
- Trả {"success":true} nghĩa là đã nhận/xử lý thông báo, không bảo đảm đăng ký đã ACTIVE. Lỗi kỹ thuật trả 5xx để SePay gửi lại.

## Luồng code

```text
FE page → service của module → enrollmentClient → apiClient chung
                                      ↓
RegistrationController → RegistrationServiceImpl → RegistrationRepository
                                  ↓
                         PaymentServiceImpl → SePayProxy
```

- RegistrationServiceImpl: đăng ký, quyền sở hữu, lịch sử, vòng đời và điều phối webhook.
- PaymentServiceImpl: API Key, mã thanh toán, tài khoản, số tiền và thời điểm giao dịch.
- SePayProxy: dựng URL QR; không gọi thêm cổng thanh toán khác.
- RegistrationExpirationJob: mỗi phút chuyển PENDING quá hạn sang EXPIRED. Service vẫn kiểm tra thời gian trực tiếp.
- Đăng ký và webhook đều khóa user trước, rồi khóa registration; việc kiểm tra và cập nhật diễn ra cùng transaction.
- CurrentStudent là điểm nối với auth. DemoStudentFilter cung cấp principal dạng Long; khi có JWT thì tích hợp danh tính thật tại đây.
- Profile enrollment-demo chỉ áp dụng X-User-Id cho API course/registration. Ngoài profile này header không xác thực được người dùng.
- Webhook có security chain riêng và kiểm tra Authorization: Apikey ... trong controller/service. Không dùng JWT hay X-User-Id cho webhook.

## Chuẩn bị database

Dùng schema database/lms_g6_v3.sql. File đó DROP DATABASE, không chạy nếu muốn giữ dữ liệu cũ.
Chuẩn bị một user có role STUDENT, status ACTIVE và khóa học đã publish với giá nguyên VND dương để thử luồng.
Nếu đang có dữ liệu cần giữ, không chạy file reset; cần nâng cấp schema riêng trước khi dùng module.
Không có script nào được ứng dụng tự chạy; ddl-auto vẫn là none.

## Cấu hình và chạy local

1. Giữ các biến DB trong backend/.env. Bổ sung biến từ backend/.env.enrollment.example với tài khoản nhận thật hoặc tài khoản sandbox SePay.
2. Điền SEPAY_BANK, SEPAY_ACCOUNT_NUMBER, SEPAY_ACCOUNT_NAME, SEPAY_WEBHOOK_API_KEY. Không commit file .env.
3. Tạo frontend/.env.local theo frontend/.env.enrollment.example, thay VITE_DEMO_USER_ID bằng ID user STUDENT đang ACTIVE trong database.
4. Từ root chạy BE:

```powershell
mvn -f backend/pom.xml spring-boot:run "-Dspring-boot.run.profiles=enrollment-demo"
```

5. Chạy FE:

```powershell
cd frontend
npm run dev
```

VITE_DEMO_USER_ID chỉ gửi khi chạy Vite dev. Build production không gửi header demo.
Không dùng profile enrollment-demo làm xác thực cho môi trường công khai. Khi tunnel để test SePay, chỉ expose đường dẫn webhook, không expose API demo có thể giả user.

## Cấu hình SePay

- Dùng một tài khoản nhận, chọn sự kiện tiền vào.
- URL: https://<host>/api/v1/registrations/webhooks/sepay.
- Chọn API Key, cùng giá trị SEPAY_WEBHOOK_API_KEY trong BE; bật tự gửi lại khi server lỗi.
- Cấu hình tiền tố mã LMS và 32 ký tự hậu tố hex nếu dashboard cho phép. BE cũng bóc tách từ content khi code không có; khi dùng fallback không bật bộ lọc loại bỏ mọi giao dịch chưa bóc được code.
- SEPAY_TRANSFER_PREFIX dành cho nội dung bắt buộc theo ngân hàng (ví dụ SEVQR hoặc TKP...). SEPAY_SUB_ACCOUNT kiểm tra tài khoản ảo khi cần; chọn cấu hình phù hợp tài khoản SePay của bạn.
- QR dùng URL ảnh chính thức của SePay, cần Internet. Không có QR thanh toán thật nếu chưa điền tài khoản nhận.

Nguồn: https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc
và https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code

## API

| Method | URL | Nội dung |
| --- | --- | --- |
| GET | /api/v1/courses | keyword, minPrice, maxPrice, page, size, sort |
| GET | /api/v1/courses/{id} | Course, modules và đăng ký hiện có của người đang xem |
| POST | /api/v1/registrations | {"courseId":10}; luôn trả 200 vì có thể dùng lại đăng ký |
| GET | /api/v1/registrations | keyword (tên course hoặc ID), status, paymentStatus, page, size |
| GET | /api/v1/registrations/{id} | Chỉ chủ sở hữu; thông tin QR chỉ khi PENDING còn hạn |
| POST | /api/v1/registrations/webhooks/sepay | Webhook API Key; response riêng {"success":true} |

API thông thường dùng ResponseBuilder/ApiError chung. Đang dùng mã lỗi chung hiện có (404, 409...) để giữ nguyên ErrorCode.

## Demo và kiểm tra

1. Chọn khóa học demo, đăng ký, kiểm tra giá và thời hạn QR.
2. Refresh hoặc bấm đăng ký lại: cùng registrationId và paymentCode khi còn hạn.
3. Dùng SePay Test mode để gửi giao dịch mô phỏng đúng mã, đúng tiền và thời gian.
4. FE tự kiểm tra 5 giây khi tab hiện hoặc bấm kiểm tra thủ công; thành công chuyển sang kết quả.
5. Gửi lại cùng webhook: không thay đổi paidAt/transactionRef và không tạo quyền mới.
6. Thử sinh viên khác: không đọc được đăng ký của người đầu.
7. Trên DB demo riêng, chuẩn bị đăng ký quá hạn và gửi giao dịch có thời điểm trước hạn để kiểm tra báo muộn. Không sửa dữ liệu thật để demo.

```powershell
cd frontend
npm run lint
npm run build
```

Kiểm tra luồng trên MySQL và giao dịch SePay thật cần môi trường đã cấu hình như trên.
