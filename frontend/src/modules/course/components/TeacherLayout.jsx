import { useHashPath } from '../../../app/router/useHashPath.js'
import './teacherCourse.css'

export default function TeacherLayout({ children }) {
  const path = useHashPath()
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
          <a className="tc-brand" href="#/teacher/courses">
            LMS
          </a>
          <nav className="tc-nav" aria-label="Main">
            <a
              className="tc-nav-link"
              href="#/teacher/courses"
              aria-current={onCourses ? 'page' : undefined}
            >
              My Courses
            </a>
            <a className="tc-nav-link" href="#/question-bank">
              Question Bank
            </a>
            <span className="tc-nav-link" aria-disabled="true">
              Practice Quizzes
            </span>
          </nav>
          <span className="tc-user">{teacherName}</span>
        </div>
      </header>
      <main className="tc-main">{children}</main>
    </div>
  )
}
