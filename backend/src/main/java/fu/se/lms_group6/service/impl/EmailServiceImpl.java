package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String fromEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "[LMS Group 6] Mã xác thực kích hoạt tài khoản";
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="background: #4f46e5; color: #ffffff; font-weight: bold; font-size: 20px; padding: 6px 14px; border-radius: 8px;">LMS</span>
                        <h2 style="color: #1e293b; margin-top: 16px;">Xác thực tài khoản học tập</h2>
                    </div>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Xin chào, cảm ơn bạn đã đăng ký tài khoản tại hệ thống LMS Group 6. Vui lòng sử dụng mã xác thực bên dưới để kích hoạt tài khoản:
                    </p>
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">%s</span>
                    </div>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
                        Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        Đây là email tự động từ hệ thống LMS Group 6. Vui lòng không phản hồi trực tiếp email này.
                    </p>
                </div>
                """
                .formatted(otpCode);

        sendMimeEmail(toEmail, subject, htmlContent);
    }

    @Override
    public void sendResetPasswordEmail(String toEmail, String otpCode) {
        String subject = "[LMS Group 6] Yêu cầu đặt lại mật khẩu";
        String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="background: #4f46e5; color: #ffffff; font-weight: bold; font-size: 20px; padding: 6px 14px; border-radius: 8px;">LMS</span>
                        <h2 style="color: #1e293b; margin-top: 16px;">Khôi phục mật khẩu tài khoản</h2>
                    </div>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Sử dụng mã OTP bên dưới để hoàn tất:
                    </p>
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">%s</span>
                    </div>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
                        Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này hoặc đổi mật khẩu để bảo vệ tài khoản.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        Đây là email tự động từ hệ thống LMS Group 6. Vui lòng không phản hồi trực tiếp email này.
                    </p>
                </div>
                """
                .formatted(otpCode);

        sendMimeEmail(toEmail, subject, htmlContent);
    }

    private void sendMimeEmail(String toEmail, String subject, String htmlContent) {
        log.info("Đang gửi email tới: {} | Tiêu đề: {}", toEmail, subject);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "LMS Group 6 Support");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email thành công tới {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email tới {}: {}", toEmail, e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR);
        }
    }
}
