# Chạy SePay với backend local

## Chuẩn bị

- Java 21, Node.js và cấu hình TiDB trong `backend/.env`.
- Các biến `SEPAY_*` đã được điền trong `backend/.env`.
- `SEPAY_WEBHOOK_API_KEY` trùng API Key của webhook trên SePay.
- File `cloudflared.exe` tại `backend/target/sepay-tunnel/cloudflared.exe`.

File cloudflared không được lưu trên Git. Máy mới cần tải bản Windows phù hợp từ trang phát hành chính thức https://github.com/cloudflare/cloudflared/releases và đặt vào đường dẫn trên, đổi tên thành `cloudflared.exe`. Tạo thư mục nếu chưa có. Thư mục `target` có thể bị xóa khi chạy Maven clean; khi đó cần đặt lại file.

## Mỗi buổi test thanh toán

### 1. Chạy BE và FE

Run `BackendApplication` trong IntelliJ, chờ backend chạy ở cổng 8080.

Mở terminal tại thư mục gốc project, chạy FE:

```powershell
cd frontend
npm run dev
```

Mở địa chỉ Vite hiển thị, thường là `http://localhost:5173`. FE cần gọi đúng backend local qua `VITE_API_BASE_URL=http://localhost:8080/api/v1`.

### 2. Chạy proxy và tunnel bằng một lệnh

Mở terminal PowerShell mới tại thư mục gốc project:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-sepay-tunnel.ps1
```

Script khởi động proxy cổng 18081 và Cloudflare Quick Tunnel. Nếu cổng 18081 đã có proxy đang chạy, script dùng proxy đó. Proxy chỉ chuyển tiếp POST tại endpoint webhook tới backend cổng 8080.

Tìm URL được in trong terminal, ví dụ:

```text
https://ten-ngau-nhien.trycloudflare.com
```

Giữ terminal mở trong lúc test. Nhấn Ctrl+C để dừng tunnel; script dừng proxy do chính nó tạo, không dừng proxy đã chạy sẵn.

### 3. Cập nhật webhook trên SePay

Vào SePay Live → Tích hợp Webhook → Sửa webhook thanh toán LMS. Đặt URL nhận webhook bằng URL vừa tạo cộng với endpoint:

```text
https://ten-ngau-nhien.trycloudflare.com/api/v1/registrations/webhooks/sepay
```

Giữ loại giao dịch Tiền vào, định dạng JSON, tài khoản nhận tiền và phương thức API Key. API Key phải trùng `SEPAY_WEBHOOK_API_KEY`. Bật tự động gửi lại khi server trả lỗi và lưu.

URL Quick Tunnel có thể đổi khi chạy lại tunnel. Chỉ cần sửa URL trên SePay nếu nó thay đổi; không điền URL tunnel vào `.env`. Restart riêng BE/FE khi tunnel vẫn chạy không yêu cầu đổi URL.

### 4. Test

Đăng nhập, chọn khóa học, đăng ký và quét QR. Giữ nguyên số tiền/nội dung chuyển khoản. Khi BE xác nhận webhook, đăng ký được cập nhật trên TiDB; trang QR kiểm tra trạng thái mỗi 5 giây khi tab hiển thị và tự chuyển sang kết quả. Nút kiểm tra thủ công cũng đọc trạng thái từ BE, không gọi ngân hàng để xác nhận giao dịch.

Nếu đã chuyển tiền nhưng còn PENDING, chưa chuyển thêm tiền: kiểm tra SePay → Lịch sử gửi webhook, xem mã HTTP và phản hồi. Sau khi sửa lỗi kết nối/cấu hình, gửi lại webhook của giao dịch đó nếu SePay cho phép.

## Khi gặp lỗi

- Không tìm thấy cloudflared: tải/đặt lại executable đúng đường dẫn ở phần chuẩn bị.
- Cổng 18081 đang dùng: script tái sử dụng tiến trình hiện có; nếu đó không phải proxy LMS, cần xác định và dừng đúng ứng dụng chiếm cổng trước khi chạy lại.
- Webhook 502: kiểm tra BE đang chạy ở cổng 8080.
- Webhook 401/403: kiểm tra URL, phương thức API Key và cấu hình security; sau khi đổi `.env` cần restart BE.
- Webhook 500: xem log BE, không reset database để thử sửa.
- Webhook 2xx nhưng PENDING: kiểm tra log xác minh mã thanh toán, tài khoản, số tiền và thời điểm; 2xx không tự chứng minh đăng ký đã được kích hoạt.

Không cần tunnel khi chỉ xem khóa học, đăng nhập hoặc gửi mail. TiDB trên cloud không thay thế backend local: máy nhận webhook vẫn phải bật BE, proxy và tunnel. Nếu cả nhóm dùng chung một tài khoản SePay, thống nhất một backend/tunnel nhận webhook để tránh thay URL của nhau.
