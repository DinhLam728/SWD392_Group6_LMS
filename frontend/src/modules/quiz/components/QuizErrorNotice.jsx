import { Link } from 'react-router'

// Hiển thị lỗi API theo status/code, không dựa vào nội dung message.
export default function QuizErrorNotice({ error }) {
  if (!error) return null
  let hint = null
  if (error.status === 401) {
    hint = <Link className="button" to="/login">Đăng nhập</Link>
  } else if (error.code === 'NOT_ENROLLED' || error.status === 403) {
    hint = <Link className="button button-secondary" to="/courses">Xem khóa học</Link>
  } else if (error.status === 0) {
    hint = <span>Không kết nối được máy chủ. Vui lòng thử lại sau.</span>
  }
  const message =
    error.status === 403 && error.code === 'FORBIDDEN'
      ? 'Chức năng làm quiz dành cho tài khoản sinh viên.'
      : error.message || 'Đã xảy ra lỗi.'
  return (
    <section className="notice notice-neutral" role="alert">
      <span className="notice-icon">!</span>
      <div>
        <h2>{message}</h2>
        {hint && <p className="quiz-error-hint">{hint}</p>}
      </div>
    </section>
  )
}
