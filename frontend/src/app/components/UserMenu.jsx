import { useEffect, useRef, useState } from 'react'
import { ClipboardList, LogOut } from 'lucide-react'

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
        <span className="profile-name">{name}</span>
      </button>
      {open && (
        <div className="profile-dropdown" id="profile-dropdown">
          <div className="profile-summary">
            <strong>{name}</strong>
            {user.email && <small>{user.email}</small>}
          </div>
          <a href="#/registrations" onClick={() => setOpen(false)}>
            <ClipboardList size={17} aria-hidden="true" />
            Đăng ký của tôi
          </a>
          <button className="profile-logout" onClick={onLogout}>
            <LogOut size={17} aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
