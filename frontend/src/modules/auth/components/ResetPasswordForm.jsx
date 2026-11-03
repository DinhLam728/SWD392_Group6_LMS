import { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import { resetPasswordApi } from '../services/authService.js'
import { ApiError } from '../../../shared/api/ApiError.js'

export default function ResetPasswordForm({ email = 'student@example.com', otp = '', onNavigate }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    if (formData.newPassword !== formData.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: 'Mật khẩu xác nhận không khớp',
      }))
      return
    }

    setLoading(true)

    try {
      await resetPasswordApi({
        email,
        otp,
        newPassword: formData.newPassword,
      })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
        if (err.errors && Array.isArray(err.errors)) {
          const mapped = {}
          err.errors.forEach((f) => {
            mapped[f.field] = f.message
          })
          setFieldErrors(mapped)
        }
      } else {
        setErrorMsg('Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
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
          <ShieldCheck size={32} />
        </div>
        <h2>Tạo mật khẩu mới</h2>
        <p>Thiết lập mật khẩu mới an toàn cho tài khoản <strong>{email}</strong></p>
      </div>

      {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

      {success ? (
        <div className="success-view">
          <div className="auth-alert success">
            Mật khẩu của bạn đã được cập nhật thành công!
          </div>
          <button
            type="button"
            className="submit-btn"
            onClick={() => onNavigate('login', { email })}
          >
            Đăng nhập ngay
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                autoFocus
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.newPassword && <span className="field-error">{fieldErrors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      )}
    </div>
  )
}
