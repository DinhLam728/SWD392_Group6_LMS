// Hiển thị lỗi API theo status/code, không dựa vào nội dung message.
export default function QuizErrorNotice({ error }) {
  if (!error) return null
  let hint = null
  if (error.status === 401) {
    hint = <a className="button" href="#/login">Đăng nhập</a>
  } else if (error.code === 'NOT_ENROLLED' || error.status === 403) {
    hint = <a className="button button-secondary" href="#/courses">Xem khóa học</a>
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
