import { useState } from 'react'
import { Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { forgotPasswordApi } from '../services/authService.js'
import { ApiError } from '../../../shared/api/ApiError.js'

export default function ForgotPasswordForm({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await forgotPasswordApi({ email })
      // Chuyển sang màn hình nhập OTP trước (chế độ forgot-password)
      onNavigate('verify-otp-reset', { email })
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <button
        type="button"
        className="back-btn"
        onClick={() => onNavigate('login')}
      >
        <ArrowLeft size={18} />
        <span>Quay lại Đăng nhập</span>
      </button>

      <div className="auth-header text-center">
        <div className="icon-badge">
          <KeyRound size={32} />
        </div>
        <h2>Quên mật khẩu?</h2>
        <p>
          Nhập địa chỉ email liên kết với tài khoản của bạn để nhận mã xác thực đặt lại mật khẩu.
        </p>
      </div>

      {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Địa chỉ Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang gửi mã...' : 'Gửi mã xác thực'}
        </button>
      </form>
    </div>
  )
}
