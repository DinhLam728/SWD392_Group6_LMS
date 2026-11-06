import { useContext } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import UserMenu from '../components/UserMenu.jsx'
import { AuthContext } from '../provider/AuthContext.js'

export default function SiteLayout({ home = '/courses', links }) {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="lms-app">
      <header className="site-header">
        <Link className="brand" to={home}>
          <span className="brand-mark">LMS</span>
          <span className="brand-caption">E-Learning Platform</span>
        </Link>
        <nav aria-label="Menu chính">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-active' : ''}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-account">
          {user ? (
            <UserMenu key={location.key} user={user} onLogout={handleLogout} />
          ) : (
            <Link className="button button-secondary" to="/login">Đăng nhập</Link>
          )}
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="site-footer">
        LMS <span>Học tập hôm nay, phát triển ngày mai.</span>
      </footer>
    </div>
  )
}
