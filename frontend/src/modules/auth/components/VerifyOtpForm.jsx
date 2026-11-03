import { useState, useEffect, useRef } from 'react'
import { MailCheck, ArrowLeft, RotateCw } from 'lucide-react'
import { verifyOtpApi, resendOtpApi, validateResetOtpApi, forgotPasswordApi } from '../services/authService.js'
import { ApiError } from '../../../shared/api/ApiError.js'

export default function VerifyOtpForm({
  email = 'student@example.com',
  mode = 'register', // 'register' hoặc 'forgot-password'
  onNavigate,
  onVerifySuccess,
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
  const inputRefs = useRef([])

  const isResetFlow = mode === 'forgot-password'

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleInputChange = (index, value) => {
    if (isNaN(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtp(digits)
      inputRefs.current[5]?.focus()
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setErrorMsg('')
    setInfoMsg('')

    try {
      if (isResetFlow) {
        await forgotPasswordApi({ email })
      } else {
        await resendOtpApi(email)
      }
      setCountdown(60)
      setInfoMsg('Mã OTP mới đã được gửi vào email của bạn.')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Không thể gửi lại mã OTP. Vui lòng thử lại sau.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = otp.join('')
    if (fullCode.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã xác thực')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setInfoMsg('')

    try {
      if (isResetFlow) {
        // Xác thực OTP khôi phục mật khẩu trước khi qua màn nhập pass mới
        await validateResetOtpApi({ email, otp: fullCode })
        if (onVerifySuccess) {
          onVerifySuccess(fullCode)
        } else {
          onNavigate('reset-password', { email, otp: fullCode })
        }
      } else {
        // Luồng kích hoạt tài khoản đăng ký
        await verifyOtpApi({ email, otp: fullCode })
        if (onVerifySuccess) {
          onVerifySuccess()
        } else {
          onNavigate('login', { email })
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Mã OTP không chính xác hoặc đã hết hạn.')
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
        onClick={() => onNavigate(isResetFlow ? 'forgot-password' : 'login')}
      >
        <ArrowLeft size={18} />
        <span>Quay lại</span>
      </button>

      <div className="auth-header text-center">
        <div className="icon-badge">
          <MailCheck size={32} />
        </div>
        <h2>{isResetFlow ? 'Xác thực đặt lại mật khẩu' : 'Xác thực tài khoản'}</h2>
        <p>
          Mã xác thực OTP gồm 6 chữ số đã được gửi đến email:
          <br />
          <strong className="text-primary">{email}</strong>
        </p>
      </div>

      {infoMsg && <div className="auth-alert success">{infoMsg}</div>}
      {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="otp-container" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="otp-box"
              autoFocus={idx === 0}
            />
          ))}
        </div>

        <div className="resend-wrapper">
          {countdown > 0 ? (
            <span className="text-muted">Gửi lại mã sau {countdown}s</span>
          ) : (
            <button
              type="button"
              className="link-btn resend-btn"
              onClick={handleResend}
            >
              <RotateCw size={14} /> Gửi lại mã OTP
            </button>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || otp.join('').length < 6}
        >
          {loading ? 'Đang kiểm tra...' : isResetFlow ? 'Tiếp tục' : 'Xác thực tài khoản'}
        </button>
      </form>
    </div>
  )
}
