import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext.js'
import { getMeApi, logoutApi } from '../../modules/auth/services/authService.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lms_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Synchronize user session with backend HttpOnly cookie on mount
  useEffect(() => {
    getMeApi()
      .then((res) => {
        if (res?.data) {
          localStorage.setItem('lms_user', JSON.stringify(res.data))
          setUser(res.data)
        }
      })
      .catch(() => {
        // Cookie is invalid or expired
        localStorage.removeItem('lms_user')
        localStorage.removeItem('lms_token')
        setUser(null)
      })
  }, [])

  function login({ token, user: nextUser }) {
    // Retain lms_token in localStorage temporarily for backward compatibility with existing services
    if (token) {
      localStorage.setItem('lms_token', token)
    }
    localStorage.setItem('lms_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
