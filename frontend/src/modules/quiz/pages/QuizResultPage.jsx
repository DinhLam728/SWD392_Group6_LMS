import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import QuizErrorNotice from '../components/QuizErrorNotice.jsx'
import { explainQuestion, getResult } from '../services/quizService.js'
import { formatDateTime, formatScore } from '../utils/quizFormat.js'
import '../styles/quiz.css'

function AiExplanation({ attemptId, questionId }) {
  const [state, setState] = useState({ loading: false, text: '', error: null })

  async function handleExplain() {
    setState({ loading: true, text: '', error: null })
    try {
      const { data } = await explainQuestion(attemptId, questionId)
      setState({ loading: false, text: data.explanation, error: null })
    } catch (e) {
      setState({ loading: false, text: '', error: e })
    }
  }

  return (
    <div className="quiz-ai">
      {!state.text && (
        <button type="button" className="button-secondary" onClick={handleExplain} disabled={state.loading}>
          {state.loading ? 'AI đang giải thích...' : 'Giải thích bằng AI'}
        </button>
      )}
      {state.text && (
        <div className="quiz-ai-text">
          <strong>Giải thích từ AI</strong>
          <p>{state.text}</p>
        </div>
      )}
      {state.error && (
        <p className="quiz-ai-error" role="alert">
          {state.error.status === 503
            ? 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.'
            : state.error.message}
        </p>
      )}
    </div>
  )
}

export default function QuizResultPage() {
  const { attemptId } = useParams()
  if (!/^\d+$/.test(attemptId)) return <p>Không tìm thấy trang.</p>
  return <QuizResultContent key={attemptId} id={attemptId} />
}

function QuizResultContent({ id }) {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getResult(id, controller.signal)
      .then(({ data }) => setResult(data))
      .catch((e) => {
        if (e.name === 'AbortError') return
        if (e.code === 'ATTEMPT_NOT_GRADED') {
          navigate(`/quiz-attempts/${id}`, { replace: true })
          return
        }
        setError(e)
      })
    return () => controller.abort()
  }, [id, navigate])

  if (!result) {
    return (
      <>
        <QuizErrorNotice error={error} />
        {!error && <p>Đang tải kết quả...</p>}
      </>
    )
  }

  return (
    <>
      <div className="breadcrumb registration-breadcrumb" aria-label="Đường dẫn trang">
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/courses/${result.courseId}`}>{result.courseTitle}</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/quizzes/${result.quizId}`}>{result.quizTitle}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Kết quả</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">KẾT QUẢ LƯỢT {result.attemptNumber}</span>
        <h1>{result.quizTitle}</h1>
      </div>
      <section className="card result-card quiz-result-card">
        <div className={`notice ${result.passed ? 'notice-success' : 'notice-neutral'}`}>
          <span className="notice-icon">{result.passed ? '✓' : '✗'}</span>
          <div>
            <h2>{result.passed ? 'Bạn đã đạt bài quiz' : 'Bạn chưa đạt bài quiz'}</h2>
            <p>
              {result.passed
                ? 'Chúc mừng! Điểm của bạn đã đạt yêu cầu.'
                : 'Xem lại các câu sai bên dưới rồi thử làm lại nhé.'}
            </p>
          </div>
        </div>
        <div className="quiz-score">
          <strong>{formatScore(result.score)}</strong>
          <span>/ 10</span>
        </div>
        <dl className="details">
          <div className="detail-field">
            <dt>Kết quả</dt>
            <dd>
              <span className={`status-badge ${result.passed ? 'status-success' : 'status-failed'}`}>
                {result.passed ? 'Đạt' : 'Chưa đạt'}
              </span>
            </dd>
          </div>
          <div className="detail-field">
            <dt>Số câu đúng</dt>
            <dd>
              {result.correctCount} / {result.totalQuestions}
            </dd>
          </div>
          <div className="detail-field">
            <dt>Điểm đạt</dt>
            <dd>{formatScore(result.passingScore)} / 10</dd>
          </div>
          <div className="detail-field">
            <dt>Nộp lúc</dt>
            <dd>{formatDateTime(result.submittedAt)}</dd>
          </div>
        </dl>
        <div className="result-actions">
          <Link className="button button-secondary" to={`/courses/${result.courseId}`}>
            ← Về khóa học
          </Link>
          <Link className="button" to={`/quizzes/${result.quizId}`}>
            Làm lại / xem lượt khác →
          </Link>
        </div>
      </section>
      <section className="quiz-review">
        <h2>Xem lại bài làm</h2>
        {result.questions.map((question) => {
          const status = question.correct ? 'correct' : question.selectedAnswer ? 'wrong' : 'empty'
          return (
            <article key={question.questionId} className={`card quiz-review-item quiz-review-${status}`}>
              <div className="quiz-review-head">
                <span className="eyebrow">CÂU {question.order}</span>
                <span
                  className={`status-badge ${status === 'correct' ? 'status-success' : status === 'wrong' ? 'status-failed' : ''}`}
                >
                  {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Bỏ trống'}
                </span>
              </div>
              <h3>{question.content}</h3>
              <ul className="quiz-review-options">
                {question.options.map((option) => {
                  const isCorrect = (question.correctAnswer || '').split(',').includes(option.key)
                  const isSelected = (question.selectedAnswer || '').split(',').includes(option.key)
                  return (
                    <li
                      key={option.key}
                      className={`${isCorrect ? 'quiz-review-correct' : ''} ${isSelected && !isCorrect ? 'quiz-review-picked' : ''}`}
                    >
                      <span className="quiz-option-key">{option.key}</span>
                      <span>{option.text}</span>
                      {isCorrect && <small>Đáp án đúng</small>}
                      {isSelected && !isCorrect && <small>Bạn chọn</small>}
                    </li>
                  )
                })}
              </ul>
              {question.explanation && (
                <p className="quiz-explanation">
                  <strong>Giải thích:</strong> {question.explanation}
                </p>
              )}
              {!question.correct && (
                <AiExplanation attemptId={result.attemptId} questionId={question.questionId} />
              )}
            </article>
          )
        })}
      </section>
    </>
  )
}
