import { useState } from 'react'
import AuthPage from './modules/auth/pages/AuthPage.jsx'
import { QuestionBankPage } from './modules/questionbank/pages/QuestionBankPage.jsx'

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

  const [viewMode, setViewMode] = useState(() => {
    return 'question-bank'
  })

  const handleLoginSuccess = (authData) => {
    if (authData.token) {
      localStorage.setItem('lms_token', authData.token)
    }
    if (authData.user) {
      localStorage.setItem('lms_user', JSON.stringify(authData.user))
      setCurrentUser(authData.user)
    }
    setViewMode('question-bank')
  }

  const handleLogout = () => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setCurrentUser(null)
    setViewMode('auth')
  }

  if (viewMode === 'auth' && !currentUser) {
    return (
      <div>
        <div style={{ textAlign: 'right', padding: '10px 20px', background: '#f8fafc' }}>
          <button
            onClick={() => setViewMode('question-bank')}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Go to Question Bank →
          </button>
        </div>
        <AuthPage onAuthSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <main>
      {currentUser && (
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', color: '#475569' }}>
            Logged in as <strong>{currentUser.fullName || currentUser.email}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '3px 8px',
              fontSize: '11.5px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sign out
          </button>
        </div>
      )}
      <QuestionBankPage />
    </main>
  )
}

export default App
