import { useEffect, useState } from 'react'
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

export default function QuizResultPage({ id }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getResult(id, controller.signal)
      .then(({ data }) => setResult(data))
      .catch((e) => {
        if (e.name === 'AbortError') return
        if (e.code === 'ATTEMPT_NOT_GRADED') {
          window.location.hash = `/quiz-attempts/${id}`
          return
        }
        setError(e)
      })
    return () => controller.abort()
  }, [id])

  if (!result) {
    return (
      <>
        <QuizErrorNotice error={error} />
        {!error && <p className="muted">Đang tải kết quả...</p>}
      </>
    )
  }

  return (
    <>
      <div className="breadcrumb" aria-label="Đường dẫn trang">
        <a href={`#/courses/${result.courseId}`}>Khóa học</a>
        <span aria-hidden="true"> / </span>
        <a href={`#/quizzes/${result.quizId}`}>{result.quizTitle}</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Kết quả</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">KẾT QUẢ LƯỢT {result.attemptNumber}</span>
        <h1>{result.quizTitle}</h1>
      </div>
      <section className={`card quiz-score-card ${result.passed ? 'quiz-score-pass' : 'quiz-score-fail'}`}>
        <div className="quiz-score">
          <strong>{formatScore(result.score)}</strong>
          <span>/ 10</span>
        </div>
        <div>
          <span className={`quiz-badge quiz-badge-${result.passed ? 'pass' : 'fail'}`}>
            {result.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
          </span>
          <p>
            Đúng {result.correctCount} / {result.totalQuestions} câu · Điểm đạt {formatScore(result.passingScore)}
          </p>
          <p className="muted">Nộp lúc {formatDateTime(result.submittedAt)}</p>
        </div>
        <div className="quiz-score-actions">
          <a className="button" href={`#/quizzes/${result.quizId}`}>
            Làm lại / xem lượt khác
          </a>
          <a className="button button-secondary" href={`#/courses/${result.courseId}`}>
            Về khóa học
          </a>
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
                <span className={`quiz-badge quiz-badge-${question.correct ? 'pass' : 'fail'}`}>
                  {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Bỏ trống'}
                </span>
              </div>
              <h3>{question.content}</h3>
              <ul className="quiz-review-options">
                {question.options.map((option) => {
                  const isCorrect = option.key === question.correctAnswer
                  const isSelected = option.key === question.selectedAnswer
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
