import './teacherCourse.css'

// The header, footer and page width come from App.jsx; this only scopes the teacher styles.
export default function TeacherLayout({ children }) {
  return <div className="tc-page">{children}</div>
}
