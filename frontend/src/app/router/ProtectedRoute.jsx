import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { AuthContext } from '../provider/AuthContext.js'
import { roleHome } from './rolePaths.js'

export default function ProtectedRoute({ role }) {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" state={{ from: location, role }} replace />
  }

  if (user.role !== role) {
    return <Navigate to={roleHome[user.role] || '/courses'} replace />
  }

  return <Outlet />
}
