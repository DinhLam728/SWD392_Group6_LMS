import UserMenu from './app/components/UserMenu.jsx'
import { useEffect, useState } from 'react'
import AvailableCoursesPage from './modules/course/pages/AvailableCoursesPage.jsx'
import CourseDetailPage from './modules/course/pages/CourseDetailPage.jsx'
import MyRegistrationsPage from './modules/enrollment/pages/MyRegistrationsPage.jsx'
import RegistrationResultPage from './modules/enrollment/pages/RegistrationResultPage.jsx'
import PaymentQrPage from './modules/payment/pages/PaymentQrPage.jsx'
import AuthPage from './modules/auth/pages/AuthPage.jsx'
import { QuestionBankPage } from './modules/questionbank/pages/QuestionBankPage.jsx'
import './app/enrollment.css'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lms_user'))
    } catch {
      return null
    }
  })

  function handleLoginSuccess(authData) {
    if (authData.token) {
      localStorage.setItem('lms_token', authData.token)
    }
    if (authData.user) {
      localStorage.setItem('lms_user', JSON.stringify(authData.user))
      setCurrentUser(authData.user)
    }
    window.location.hash = authData.user?.role === 'TEACHER' ? '/question-bank' : '/courses'
  }

  function handleLogout() {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setCurrentUser(null)
    window.location.hash = '/login'
  }

  const [path, setPath] = useState(window.location.hash.slice(1) || '/courses')

  useEffect(() => {
    const update = () => setPath(window.location.hash.slice(1) || '/courses')
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  let page = <p>Không tìm thấy trang.</p>
  const course = path.match(/^\/courses\/(\d+)$/)
  const registration = path.match(/^\/registrations\/(\d+)(\/payment)?$/)

  if (path === '/login') {
    page = <AuthPage onAuthSuccess={handleLoginSuccess} />
  } else if (path === '/courses') {
    page = <AvailableCoursesPage />
  } else if (course) {
    page = <CourseDetailPage key={path} id={course[1]} />
  } else if (path.split('?')[0] === '/registrations') {
    const keyword = new URLSearchParams(path.split('?')[1]).get('keyword') || ''
    page = <MyRegistrationsPage key={path} initialKeyword={keyword} />
  } else if (registration) {
    page = registration[2] ? (
      <PaymentQrPage key={path} id={registration[1]} />
    ) : (
      <RegistrationResultPage key={path} id={registration[1]} />
    )
  } else if (path === '/question-bank' || path === '/questions') {
    page =
      currentUser?.role === 'TEACHER' ? (
        <QuestionBankPage />
      ) : (
        <section className="card">
          <h1>Chức năng dành cho giáo viên</h1>
          <p>
            Vui lòng đăng nhập bằng tài khoản giáo viên để mở ngân hàng câu
            hỏi.
          </p>
          <a href={currentUser ? '#/courses' : '#/login'}>
            {currentUser ? 'Về khóa học' : 'Đăng nhập'}
          </a>
        </section>
      )
  }
  if (path === '/login') {
    return <AuthPage onAuthSuccess={handleLoginSuccess} />
  }
  return (
    <div className="lms-app">
      <header className="site-header">
        <a className="brand" href="#/courses">
          <span className="brand-mark">LMS</span>
          <span className="brand-caption">E-Learning Platform</span>
        </a>
        <nav aria-label="Menu chính">
          <a
            className={
              path.startsWith('/courses') || path.startsWith('/registrations')
                ? 'nav-active'
                : ''
            }
            href="#/courses"
          >
            Khóa học
          </a>
        </nav>
        <div className="header-account">
          {currentUser ? (
            <UserMenu key={path} user={currentUser} onLogout={handleLogout} />
          ) : (
            <a className="button button-secondary" href="#/login">
              Đăng nhập
            </a>
          )}
        </div>
      </header>
      <main className="page-content">{page}</main>
      <footer className="site-footer">
        LMS <span>Học tập hôm nay, phát triển ngày mai.</span>
      </footer>
    </div>
  )
}
