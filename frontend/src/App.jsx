import { useState } from 'react'
import AuthPage from './modules/auth/pages/AuthPage.jsx'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('lms_user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch (e) {
        console.error('Failed to parse saved user', e)
      }
    }
    return null
  })

  const handleLoginSuccess = (authData) => {
    // authData: { token, tokenType, user }
    if (authData.token) {
      localStorage.setItem('lms_token', authData.token)
    }
    if (authData.user) {
      localStorage.setItem('lms_user', JSON.stringify(authData.user))
      setCurrentUser(authData.user)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setCurrentUser(null)
  }

  if (currentUser) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '60px auto', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color: '#4f46e5' }}>🎉 Đăng nhập thành công!</h2>
        <p>Xin chào, <strong>{currentUser.fullName}</strong> ({currentUser.email})</p>
        <p>Vai trò: <span style={{ padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', fontWeight: 600 }}>{currentUser.role}</span></p>
        <p>Trạng thái tài khoản: <strong>{currentUser.status}</strong></p>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Đăng xuất
        </button>
      </div>
    )
  }

  return <AuthPage onAuthSuccess={handleLoginSuccess} />
}

export default App
