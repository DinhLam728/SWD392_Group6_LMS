import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="tc-page-head">
      <h1>Page not found</h1>
      <p className="tc-subtitle">
        This page does not exist. <Link to="/teacher/courses">Go to My Courses</Link>
      </p>
    </div>
  )
}
