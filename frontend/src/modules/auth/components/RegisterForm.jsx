import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, School } from 'lucide-react'
import { registerApi } from '../services/authService.js'
import { ApiError } from '../../../shared/api/ApiError.js'

export default function RegisterForm({ onNavigate, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    agreePolicy: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: 'Mật khẩu xác nhận không khớp',
      }))
      return
    }

    if (!formData.agreePolicy) {
      setErrorMsg('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật')
      return
    }

    setLoading(true)

    try {
      const response = await registerApi({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      if (onRegisterSuccess) {
        onRegisterSuccess(formData.email, response.data)
      } else {
        onNavigate('verify-otp', { email: formData.email })
      }
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
        setErrorMsg('Không thể kết nối đến máy chủ. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Tạo tài khoản mới</h2>
        <p>Bắt đầu hành trình chinh phục kiến thức của bạn ngay hôm nay</p>
      </div>

      {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="fullName">Họ và tên</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
          {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />
          </div>
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="form-group">
          <label>Vai trò</label>
          <div className="role-selector">
            <label className={`role-card ${formData.role === 'STUDENT' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="STUDENT"
                checked={formData.role === 'STUDENT'}
                onChange={handleChange}
              />
              <GraduationCap size={20} />
              <span>Học viên</span>
            </label>
            <label className={`role-card ${formData.role === 'TEACHER' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="TEACHER"
                checked={formData.role === 'TEACHER'}
                onChange={handleChange}
              />
              <School size={20} />
              <span>Giảng viên</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
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
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
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

        <div className="checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreePolicy"
              checked={formData.agreePolicy}
              onChange={handleChange}
              required
            />
            <span>
              Tôi đồng ý với <a href="#terms" onClick={(e) => e.preventDefault()}>Điều khoản dịch vụ</a> và{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>
            </span>
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>

        <div className="auth-footer">
          <span>Đã có tài khoản? </span>
          <button
            type="button"
            className="link-btn font-bold"
            onClick={() => onNavigate('login')}
          >
            Đăng nhập
          </button>
        </div>
      </form>
    </div>
  )
}
