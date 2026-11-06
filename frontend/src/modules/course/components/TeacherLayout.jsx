import { Link, Outlet, useLocation } from 'react-router'
import './teacherCourse.css'

export default function TeacherLayout() {
  const { pathname: path } = useLocation()
  const onCourses = path.startsWith('/teacher/courses')
  let teacherName = 'Teacher'
  try {
    const user = JSON.parse(localStorage.getItem('lms_user'))
    if (user?.fullName) {
      teacherName = user.fullName
    }
  } catch {
    // ignore invalid json
  }

  return (
    <div className="tc-app">
      <header className="tc-topbar">
        <div className="tc-topbar-inner">
          <Link className="tc-brand" to="/teacher/courses">
            LMS
          </Link>
          <nav className="tc-nav" aria-label="Main">
            <Link
              className="tc-nav-link"
              to="/teacher/courses"
              aria-current={onCourses ? 'page' : undefined}
            >
              My Courses
            </Link>
            <Link className="tc-nav-link" to="/question-bank">
              Question Bank
            </Link>
            <span className="tc-nav-link" aria-disabled="true">
              Practice Quizzes
            </span>
          </nav>
          <span className="tc-user">{teacherName}</span>
        </div>
      </header>
      <main className="tc-main"><Outlet /></main>
    </div>
  )
}
