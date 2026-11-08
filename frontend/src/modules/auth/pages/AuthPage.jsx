import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AuthContext } from '../../../app/provider/AuthContext.js'
import { roleHome } from '../../../app/router/rolePaths.js'
import { useState } from 'react'
import LoginForm from '../components/LoginForm.jsx'
import RegisterForm from '../components/RegisterForm.jsx'
import VerifyOtpForm from '../components/VerifyOtpForm.jsx'
import ForgotPasswordForm from '../components/ForgotPasswordForm.jsx'
import ResetPasswordForm from '../components/ResetPasswordForm.jsx'
import '../styles/auth.css'

export default function AuthPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const { state } = useLocation()

  function handleLoginSuccess(user) {
    login(user)
    const role = user?.role
    const destination = state?.role === role && state?.from
      ? state.from
      : roleHome[role] || '/courses'
    navigate(destination, { replace: true })
  }

  const [currentView, setCurrentView] = useState('login')
  const [authEmail, setAuthEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')

  const handleNavigate = (view, data = {}) => {
    if (data.email) {
      setAuthEmail(data.email)
    }
    if (data.otp) {
      setResetOtp(data.otp)
    }
    setCurrentView(view)
  }

  const handleRegisterSuccess = (email) => {
    setAuthEmail(email)
    setCurrentView('verify-otp-register')
  }

  const handleVerifyRegisterSuccess = () => {
    setCurrentView('login')
  }

  const handleVerifyResetOtpSuccess = (validOtp) => {
    setResetOtp(validOtp)
    setCurrentView('reset-password')
  }

  return (
    <div className="auth-container">
      <div className="auth-background-shape shape-1" />
      <div className="auth-background-shape shape-2" />

      <div className="auth-wrapper">
        <div className="auth-brand">
          <div className="brand-logo">LMS</div>
          <span className="brand-title">E-Learning Platform</span>
        </div>

        {currentView === 'login' && (
          <LoginForm
            initialEmail={authEmail}
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'register' && (
          <RegisterForm
            onNavigate={handleNavigate}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {currentView === 'verify-otp-register' && (
          <VerifyOtpForm
            email={authEmail}
            mode="register"
            onNavigate={handleNavigate}
            onVerifySuccess={handleVerifyRegisterSuccess}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordForm onNavigate={handleNavigate} />
        )}

        {currentView === 'verify-otp-reset' && (
          <VerifyOtpForm
            email={authEmail}
            mode="forgot-password"
            onNavigate={handleNavigate}
            onVerifySuccess={handleVerifyResetOtpSuccess}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordForm
            email={authEmail}
            otp={resetOtp}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  )
}
