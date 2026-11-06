import { Link } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { ClipboardList, LogOut, LibraryBig } from 'lucide-react'

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const container = useRef(null)
  const trigger = useRef(null)

  useEffect(() => {
    if (!open) return
    function closeOutside(event) {
      if (!container.current?.contains(event.target)) setOpen(false)
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const name = user.fullName || 'Tài khoản'
  const roleLabel =
    { STUDENT: 'Học sinh', TEACHER: 'Giáo viên' }[user.role] || 'Tài khoản'
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className="user-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        className="profile-trigger"
        ref={trigger}
        aria-label={`Tài khoản của ${name}`}
        title={name}
        aria-expanded={open}
        aria-controls="profile-dropdown"
        onClick={() => setOpen(!open)}
      >
        <span className="profile-avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="profile-identity">
          <span className="profile-name">{name}</span>
          <span className="profile-role">{roleLabel}</span>
        </span>
      </button>
      {open && (
        <div className="profile-dropdown" id="profile-dropdown">
          <div className="profile-summary">
            <div className="profile-summary-heading">
              <strong>{name}</strong>
              <span className="profile-role">{roleLabel}</span>
            </div>
            {user.email && <small>{user.email}</small>}
          </div>
          {user.role === 'STUDENT' && (
            <Link to="/registrations" onClick={() => setOpen(false)}>
              <ClipboardList size={17} aria-hidden="true" />
              Đăng ký của tôi
            </Link>
          )}
          {user.role === 'TEACHER' && (
            <Link to="/question-bank" onClick={() => setOpen(false)}>
              <LibraryBig size={17} aria-hidden="true" />
              Ngân hàng câu hỏi
            </Link>
          )}
          <button className="profile-logout" onClick={onLogout}>
            <LogOut size={17} aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
