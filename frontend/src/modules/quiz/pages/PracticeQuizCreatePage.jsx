import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import QuizErrorNotice from '../components/QuizErrorNotice.jsx'
import { createPracticeQuiz, getPracticeQuizSetup } from '../services/quizService.js'
import '../styles/quiz.css'

// Sinh viên tự tạo quiz ôn tập cho một module, các lựa chọn được lưu vào quiz_configs.
export default function PracticeQuizCreatePage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [setup, setSetup] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getPracticeQuizSetup(moduleId, controller.signal)
      .then(({ data }) => setSetup(data))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e)
      })
    return () => controller.abort()
  }, [moduleId])

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError(null)
    try {
      const { data } = await createPracticeQuiz(moduleId, {
        title: form.get('title'),
        questionCount: Number(form.get('questionCount')),
        durationMinutes: Number(form.get('durationMinutes')),
        maxAttempts: Number(form.get('maxAttempts')),
        passingScore: Number(form.get('passingScore')),
        randomQuestions: form.get('randomQuestions') === 'on',
        shuffleQuestions: form.get('shuffleQuestions') === 'on',
        shuffleOptions: form.get('shuffleOptions') === 'on',
      })
      navigate(`/quizzes/${data.quizId}`)
    } catch (e) {
      setError(e)
      setSaving(false)
    }
  }

  return (
    <>
      <div className="breadcrumb registration-breadcrumb" aria-label="Đường dẫn trang">
        <Link to="/courses">Khóa học</Link>
        {setup && (
          <>
            <span aria-hidden="true"> / </span>
            <Link to={`/courses/${setup.courseId}`}>{setup.courseTitle}</Link>
          </>
        )}
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Tạo quiz ôn tập</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">QUIZ ÔN TẬP</span>
        <h1>Tạo quiz ôn tập</h1>
        {setup && <p>{setup.moduleTitle}</p>}
      </div>
      <QuizErrorNotice error={error} />
      {!setup && !error && <p>Đang tải...</p>}
      {setup && (
        <form className="card practice-form" onSubmit={handleSubmit}>
          <p>
            Module này có <strong>{setup.availableQuestions}</strong> câu hỏi trong ngân hàng câu hỏi.
            {setup.availableQuestions === 0 && ' Bạn chưa thể tạo quiz ôn tập.'}
          </p>
          <label className="practice-form-wide">
            Tên quiz (không bắt buộc)
            <input name="title" maxLength={150} placeholder={`Ôn tập ${setup.moduleTitle}`} />
          </label>
          <label>
            Số câu hỏi
            <input
              name="questionCount"
              type="number"
              min={1}
              max={Math.max(1, setup.availableQuestions)}
              defaultValue={Math.min(10, Math.max(1, setup.availableQuestions))}
              required
            />
          </label>
          <label>
            Thời gian (phút)
            <input name="durationMinutes" type="number" min={1} max={180} defaultValue={15} required />
          </label>
          <label>
            Số lượt làm
            <input name="maxAttempts" type="number" min={1} max={10} defaultValue={3} required />
          </label>
          <label>
            Điểm đạt (thang 10)
            <input name="passingScore" type="number" min={0} max={10} step={0.5} defaultValue={5} required />
          </label>
          <label className="practice-check">
            <input name="randomQuestions" type="checkbox" defaultChecked />
            Lấy câu hỏi ngẫu nhiên từ ngân hàng
          </label>
          <label className="practice-check">
            <input name="shuffleQuestions" type="checkbox" defaultChecked />
            Trộn thứ tự câu hỏi
          </label>
          <label className="practice-check">
            <input name="shuffleOptions" type="checkbox" />
            Trộn thứ tự đáp án
          </label>
          <div className="practice-form-wide practice-form-actions">
            <Link className="button button-secondary" to={`/modules/${moduleId}/practice-quizzes`}>
              Hủy
            </Link>
            <button type="submit" disabled={saving || setup.availableQuestions === 0}>
              {saving ? 'Đang tạo...' : 'Tạo quiz'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
