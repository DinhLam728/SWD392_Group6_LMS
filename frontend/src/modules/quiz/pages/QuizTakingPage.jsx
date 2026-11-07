import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import CountdownTimer from '../components/CountdownTimer.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import QuestionNavigator from '../components/QuestionNavigator.jsx'
import QuizErrorNotice from '../components/QuizErrorNotice.jsx'
import SubmitConfirmDialog from '../components/SubmitConfirmDialog.jsx'
import { getAttempt, submitAttempt } from '../services/quizService.js'
import { clearDraft, formatDateTime, loadDraft, parseServerTime, saveDraft } from '../utils/quizFormat.js'
import '../styles/quiz.css'

export default function QuizTakingPage() {
  const { attemptId } = useParams()
  if (!/^\d+$/.test(attemptId)) return <p>Không tìm thấy trang.</p>
  return <QuizTakingContent key={attemptId} id={attemptId} />
}

function QuizTakingContent({ id }) {
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [endAt, setEndAt] = useState(null)
  const [current, setCurrent] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const submittingRef = useRef(false)
  const answersRef = useRef({})

  useEffect(() => {
    const controller = new AbortController()
    getAttempt(id, controller.signal)
      .then(({ data }) => {
        if (data.status !== 'IN_PROGRESS') {
          navigate(`/quiz-attempts/${id}/result`, { replace: true })
          return
        }
        const validIds = new Set(data.questions.map((q) => String(q.questionId)))
        const draft = Object.fromEntries(
          Object.entries(loadDraft(id)).filter(([questionId]) => validIds.has(questionId)),
        )
        answersRef.current = draft
        setAnswers(draft)
        // Đếm theo chênh lệch giờ server để không phụ thuộc đồng hồ máy người dùng.
        setEndAt(Date.now() + parseServerTime(data.deadline) - parseServerTime(data.serverTime))
        setAttempt(data)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e)
      })
    return () => controller.abort()
  }, [id, navigate])

  function handleSelect(questionId, key) {
    const next = { ...answersRef.current, [questionId]: key }
    answersRef.current = next
    setAnswers(next)
    saveDraft(id, next)
  }

  const submit = useCallback(async () => {
    if (submittingRef.current || !attempt) return
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    const payload = attempt.questions.map((question) => ({
      questionId: question.questionId,
      selectedAnswer: answersRef.current[question.questionId] || null,
    }))
    try {
      await submitAttempt(id, payload)
      clearDraft(id)
      navigate(`/quiz-attempts/${id}/result`, { replace: true })
    } catch (e) {
      if (e.code === 'ATTEMPT_ALREADY_SUBMITTED' || e.code === 'ATTEMPT_EXPIRED') {
        clearDraft(id)
        navigate(`/quiz-attempts/${id}/result`, { replace: true })
        return
      }
      setError(e)
      setConfirmOpen(false)
      setSubmitting(false)
      submittingRef.current = false
    }
  }, [attempt, id, navigate])

  if (!attempt) {
    return (
      <>
        <QuizErrorNotice error={error} />
        {!error && <p className="muted">Đang tải đề...</p>}
      </>
    )
  }

  const total = attempt.questions.length
  const question = attempt.questions[current]
  const answeredCount = attempt.questions.filter((q) => answers[q.questionId]).length

  return (
    <>
      <div className="breadcrumb" aria-label="Đường dẫn trang">
        <Link to={`/courses/${attempt.courseId}`}>Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/quizzes/${attempt.quizId}`}>{attempt.quizTitle}</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Làm bài</span>
      </div>
      <div className="quiz-taking-header">
        <div>
          <span className="eyebrow">ĐANG LÀM BÀI</span>
          <h1>{attempt.quizTitle}</h1>
          <p className="muted">Bắt đầu lúc {formatDateTime(attempt.startedAt)}</p>
        </div>
        {endAt !== null && <CountdownTimer endAt={endAt} onExpire={submit} />}
      </div>
      <QuizErrorNotice error={error} />
      <div className="quiz-taking-layout">
        <div>
          {question && (
            <QuestionCard
              question={question}
              total={total}
              selected={answers[question.questionId]}
              onSelect={handleSelect}
              disabled={submitting}
            />
          )}
          <div className="quiz-step-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setCurrent((index) => index - 1)}
              disabled={current === 0}
            >
              Câu trước
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => setCurrent((index) => index + 1)}
              disabled={current === total - 1}
            >
              Câu sau
            </button>
          </div>
        </div>
        <aside className="card quiz-side">
          <h2>Câu hỏi</h2>
          <p className="muted">
            Đã trả lời {answeredCount} / {total}
          </p>
          <QuestionNavigator
            questions={attempt.questions}
            answers={answers}
            currentIndex={current}
            onJump={setCurrent}
          />
          <button type="button" onClick={() => setConfirmOpen(true)} disabled={submitting}>
            Nộp bài
          </button>
        </aside>
      </div>
      <SubmitConfirmDialog
        open={confirmOpen}
        unanswered={total - answeredCount}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </>
  )
}
