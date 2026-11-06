import { useEffect, useState } from 'react'
import QuizErrorNotice from '../components/QuizErrorNotice.jsx'
import { getQuiz, startAttempt } from '../services/quizService.js'
import { formatDateTime, formatScore } from '../utils/quizFormat.js'
import '../styles/quiz.css'

function resultLabel(attempt) {
  if (attempt.status === 'IN_PROGRESS') return 'Đang làm'
  if (attempt.passed === true) return 'Đạt'
  if (attempt.passed === false) return 'Chưa đạt'
  return attempt.status
}

export default function QuizStartPage({ id }) {
  const [quiz, setQuiz] = useState(null)
  const [error, setError] = useState(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getQuiz(id, controller.signal)
      .then(({ data }) => setQuiz(data))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e)
      })
    return () => controller.abort()
  }, [id])

  async function handleStart() {
    setStarting(true)
    setError(null)
    try {
      const { data } = await startAttempt(id)
      window.location.hash = `/quiz-attempts/${data.attemptId}`
    } catch (e) {
      setError(e)
      setStarting(false)
    }
  }

  return (
    <>
      <div className="breadcrumb" aria-label="Đường dẫn trang">
        <a href="#/courses">Khóa học</a>
        {quiz && (
          <>
            <span aria-hidden="true"> / </span>
            <a href={`#/courses/${quiz.courseId}`}>{quiz.courseTitle}</a>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{quiz.title}</span>
          </>
        )}
      </div>
      <div className="page-heading">
        <span className="eyebrow">PRACTICE QUIZ</span>
        <h1>{quiz ? quiz.title : 'Bài quiz'}</h1>
        {quiz && <p className="muted">{quiz.moduleTitle}</p>}
      </div>
      <QuizErrorNotice error={error} />
      {!quiz && !error && <p className="muted">Đang tải bài quiz...</p>}
      {quiz && (
        <div className="quiz-start-layout">
          <section className="card">
            <h2>Thông tin bài quiz</h2>
            <dl className="quiz-facts">
              <div>
                <dt>Số câu hỏi</dt>
                <dd>{quiz.questionCount}</dd>
              </div>
              <div>
                <dt>Thời gian</dt>
                <dd>{quiz.durationMinutes} phút</dd>
              </div>
              <div>
                <dt>Điểm đạt</dt>
                <dd>{formatScore(quiz.passingScore)} / 10</dd>
              </div>
              <div>
                <dt>Số lượt đã làm</dt>
                <dd>
                  {quiz.attemptsUsed} / {quiz.maxAttempts}
                </dd>
              </div>
              <div>
                <dt>Điểm cao nhất</dt>
                <dd>{quiz.bestScore === null ? 'Chưa có' : `${formatScore(quiz.bestScore)} / 10`}</dd>
              </div>
            </dl>
            <h3>Hướng dẫn</h3>
            <ul className="quiz-instructions">
              <li>Mỗi câu có một đáp án đúng. Câu bỏ trống được tính là sai.</li>
              <li>Bài được chấm tự động ngay khi nộp, điểm tính theo thang 10.</li>
              <li>Hết giờ, hệ thống tự nộp bài với các đáp án bạn đã chọn.</li>
            </ul>
          </section>
          <aside className="card quiz-start-card">
            {quiz.inProgressAttemptId ? (
              <p>Bạn đang có một lượt làm dở. Thời gian vẫn tiếp tục được tính.</p>
            ) : quiz.questionCount === 0 ? (
              <p>Bài quiz chưa có câu hỏi.</p>
            ) : quiz.remainingAttempts === 0 ? (
              <p>Bạn đã dùng hết số lượt làm bài quiz này.</p>
            ) : (
              <p>Còn {quiz.remainingAttempts} lượt làm bài.</p>
            )}
            <button type="button" onClick={handleStart} disabled={!quiz.canStart || starting}>
              {starting
                ? 'Đang chuẩn bị câu hỏi...'
                : quiz.inProgressAttemptId
                  ? 'Tiếp tục làm bài'
                  : 'Bắt đầu làm bài'}
            </button>
            <a className="button button-secondary" href={`#/courses/${quiz.courseId}`}>
              Về khóa học
            </a>
          </aside>
        </div>
      )}
      {quiz && quiz.attempts.length > 0 && (
        <section className="card quiz-history">
          <h2>Các lần làm trước</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lượt</th>
                  <th>Nộp lúc</th>
                  <th>Điểm</th>
                  <th>Kết quả</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quiz.attempts.map((attempt) => (
                  <tr key={attempt.attemptId}>
                    <td>{attempt.attemptNumber}</td>
                    <td>{formatDateTime(attempt.submittedAt)}</td>
                    <td>{formatScore(attempt.score)}</td>
                    <td>
                      <span className={`quiz-badge quiz-badge-${attempt.passed === true ? 'pass' : attempt.passed === false ? 'fail' : 'neutral'}`}>
                        {resultLabel(attempt)}
                      </span>
                    </td>
                    <td>
                      {attempt.status === 'GRADED' && (
                        <a href={`#/quiz-attempts/${attempt.attemptId}/result`}>Xem kết quả</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
