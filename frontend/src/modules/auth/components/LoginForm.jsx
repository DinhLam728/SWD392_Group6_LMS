import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { loginApi, googleLoginApi } from '../services/authService.js'
import { ApiError } from '../../../shared/api/ApiError.js'

export default function LoginForm({ initialEmail = '', onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(
    initialEmail ? 'Kích hoạt tài khoản thành công! Vui lòng nhập mật khẩu để đăng nhập.' : ''
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const googleBtnRef = useRef(null)

  // Khởi tạo Google Identity Services Button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    const handleGoogleResponse = async (response) => {
      if (!response.credential) return
      setLoading(true)
      setErrorMsg('')

      try {
        const res = await googleLoginApi(response.credential)
        if (onLoginSuccess) {
          onLoginSuccess(res.data)
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message)
        } else {
          setErrorMsg('Đăng nhập bằng Google thất bại. Vui lòng thử lại.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (window.google && clientId && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'center',
      })
    }
  }, [onLoginSuccess])

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
    setSuccessMsg('')
    setFieldErrors({})
    setLoading(true)

    try {
      const response = await loginApi({
        email: formData.email,
        password: formData.password,
      })
      if (onLoginSuccess) {
        onLoginSuccess(response.data)
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
        <h2>Chào mừng trở lại</h2>
        <p>Vui lòng đăng nhập để tiếp tục học tập cùng LMS</p>
      </div>

      {successMsg && <div className="auth-alert success">{successMsg}</div>}
      {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
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
          <label htmlFor="password">Mật khẩu</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              autoFocus={!!initialEmail}
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

        <div className="form-row-between">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <button
            type="button"
            className="link-btn"
            onClick={() => onNavigate('forgot-password')}
          >
            Quên mật khẩu?
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="divider">
          <span>hoặc đăng nhập với</span>
        </div>

        {/* Nút đăng nhập Google chính thức của Google Identity Services */}
        <div ref={googleBtnRef} className="google-sso-wrapper" />

        <div className="auth-footer">
          <span>Chưa có tài khoản? </span>
          <button
            type="button"
            className="link-btn font-bold"
            onClick={() => onNavigate('register')}
          >
            Đăng ký ngay
          </button>
        </div>
      </form>
    </div>
  )
}
