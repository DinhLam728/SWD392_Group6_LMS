import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { AuthContext } from '../provider/AuthContext.js'
import { roleHome } from './rolePaths.js'

export default function ProtectedRoute({ role }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const demoStudent = role === 'STUDENT'
    && import.meta.env.DEV
    && import.meta.env.VITE_DEMO_USER_ID
    && !localStorage.getItem('lms_token')

  if (!user && !demoStudent) {
    return <Navigate to="/login" state={{ from: location, role }} replace />
  }

  if (user && user.role !== role) {
    return <Navigate to={roleHome[user.role] || '/courses'} replace />
  }

  return <Outlet />
}
