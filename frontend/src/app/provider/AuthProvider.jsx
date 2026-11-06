import { useState } from 'react'
import { AuthContext } from './AuthContext.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('lms_token')
        ? JSON.parse(localStorage.getItem('lms_user'))
        : null
    } catch {
      return null
    }
  })

  function login({ token, user: nextUser }) {
    localStorage.setItem('lms_token', token)
    localStorage.setItem('lms_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  function logout() {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
