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

  useEffect(() => {
    if (!localStorage.getItem('lms_user')) return
    getMeApi()
      .then((res) => {
        if (res?.data) {
          localStorage.setItem('lms_user', JSON.stringify(res.data))
          setUser(res.data)
        }
      })
      .catch(() => {
        localStorage.removeItem('lms_user')
        setUser(null)
      })
  }, [])

  function login(nextUser) {
    localStorage.setItem('lms_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
    } finally {
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
