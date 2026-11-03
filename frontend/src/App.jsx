import { useEffect, useState } from 'react'
import AvailableCoursesPage from './modules/course/pages/AvailableCoursesPage.jsx'
import CourseDetailPage from './modules/course/pages/CourseDetailPage.jsx'
import MyRegistrationsPage from './modules/enrollment/pages/MyRegistrationsPage.jsx'
import RegistrationResultPage from './modules/enrollment/pages/RegistrationResultPage.jsx'
import PaymentQrPage from './modules/payment/pages/PaymentQrPage.jsx'
import './app/enrollment.css'

export default function App() {
  const [path, setPath] = useState(window.location.hash.slice(1) || '/courses')
  useEffect(() => {
    const update = () => setPath(window.location.hash.slice(1) || '/courses')
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  let page = <p>Không tìm thấy trang.</p>
  const course = path.match(/^\/courses\/(\d+)$/)
  const registration = path.match(/^\/registrations\/(\d+)(\/payment)?$/)
  if (path === '/courses') {
    page = <AvailableCoursesPage />
  } else if (course) {
    page = <CourseDetailPage key={path} id={course[1]} />
  } else if (path === '/registrations') {
    page = <MyRegistrationsPage />
  } else if (registration) {
    page = registration[2] ? (
      <PaymentQrPage key={path} id={registration[1]} />
    ) : (
      <RegistrationResultPage key={path} id={registration[1]} />
    )
  }
  return (
    <>
      <header>
        <a className="brand" href="#/courses">
          LMS
        </a>
        <nav>
          <a href="#/courses">Khóa học</a>
          <a href="#/registrations">Đăng ký của tôi</a>
        </nav>
      </header>
      <main>{page}</main>
    </>
  )
}
