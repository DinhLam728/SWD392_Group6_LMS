# Database LMS Group 6

Database `lms_g6`, MySQL 8.0+. SQL v4 là schema hiện tại tương ứng code BE.

## Thứ tự chạy

1. Sao lưu nếu cần giữ tài khoản, khóa học hoặc giao dịch cũ.
2. Chạy toàn bộ `lms_g6_v4.sql` trong MySQL Workbench để tạo lại 10 bảng. **File có DROP DATABASE: xóa toàn bộ dữ liệu lms_g6 đang có.**
3. Chạy `seed_enrollment_demo.sql` nếu muốn dữ liệu mẫu để xem và thử luồng enrollment.
4. Đặt `DB_NAME=lms_g6` trong `backend/.env`, restart BE; giữ `ddl-auto: none`.
5. Đăng ký/xác thực tài khoản STUDENT qua ứng dụng, hoặc đăng nhập Google, rồi thử đăng ký khóa học.

Không cần chạy SQL migration hay seed cũ. Hai file đều chạy thủ công, ứng dụng không tự thực thi.

## Những thay đổi v4 đã bao gồm

- `courses.created_at`: ngày tạo, mặc định thời gian DB; nullable cho dữ liệu cũ chưa biết ngày.
- `courses.price > 0`: khóa học trả phí; dùng DECIMAL(12,2).
- `registrations.expires_at`: hạn thanh toán, BE đặt bằng registered_at + 24 giờ.
- Bỏ unique sinh viên–khóa học, giữ index thường để lưu lịch sử đăng ký lại sau hết hạn. BE ngăn tạo trùng đăng ký ACTIVE/PENDING còn hạn.
- `registration_id`: BIGINT AUTO_INCREMENT, Java Long. REG-00001 chỉ là định dạng hiển thị FE.
- `payment_code` và `transaction_ref` duy nhất; trạng thái đăng ký/thanh toán và paid_at lưu trong registrations.
- Course → Module → Lesson và Module → Quiz. Question bank thuộc course; questions.quiz_id có thể null.
- Quiz config, attempt và answer giữ cấu trúc hiện tại, điểm theo thang 0–10, mặc định đạt 5.00.

Tìm kiếm, sort, kích thước trang (8 course, 7 registration), dropdown mục lục và polling 5 giây là logic code, không cần cột DB riêng.

## Seed enrollment

- 1 giảng viên mẫu sở hữu dữ liệu, email teacher.enrollment@example.test, không có mật khẩu đăng nhập.
- 18 khóa học đã publish, giá 5.000–90.000 VND, đủ thử 3 trang ở kích thước 8.
- 18 ngày tạo giả lập khác nhau để kiểm tra Mới nhất/Cũ nhất.
- 24 module, mỗi module có 3 lesson và 1 tiêu đề quiz ACTIVE để xem mục lục.
- Không seed câu hỏi/cấu hình quiz hoặc chức năng học/làm quiz.
- Không seed tài khoản sinh viên, đăng ký, giao dịch thanh toán hoặc bí mật cấu hình.

Seed có thể chạy lại tuần tự, chỉ thêm bản ghi mẫu còn thiếu, không ghi đè ngày tạo hay trạng thái thanh toán có sẵn. Nếu muốn thử thanh toán thật, cấu hình SePay Live và webhook riêng; seed không thay thế quá trình xác nhận giao dịch.

## Cập nhật tài liệu thiết kế

Cập nhật ERD/mô tả bảng với courses.created_at và registrations.expires_at; bỏ mô tả unique(student_id, course_id). Giữ mô tả khóa chính dạng số và tách mã hiển thị REG-xxxxx khỏi payment_code. Cấu trúc chương/bài học/quiz giữ quan hệ như trên.

## Kiểm chứng bản hiện tại

Đã chạy schema và seed trên database tạm riêng, chạy seed hai lần không sinh bản ghi trùng. Đã đối chiếu toàn bộ cột của 10 entity và khởi động BE với Hibernate `ddl-auto=validate` thành công. Database đang dùng không bị reset trong quá trình kiểm tra.
