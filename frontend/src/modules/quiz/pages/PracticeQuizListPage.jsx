import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import QuizErrorNotice from '../components/QuizErrorNotice.jsx'
import { getPracticeQuizSetup } from '../services/quizService.js'
import { formatScore } from '../utils/quizFormat.js'
import '../styles/quiz.css'

export default function PracticeQuizListPage() {
  const { moduleId } = useParams()
  const [setup, setSetup] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    getPracticeQuizSetup(moduleId, controller.signal)
      .then(({ data }) => setSetup(data))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e)
      })
    return () => controller.abort()
  }, [moduleId])

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
        <span aria-current="page">Quiz ôn tập của bạn</span>
      </div>
      <div className="page-heading practice-list-heading">
        <div>
          <span className="eyebrow">QUIZ ÔN TẬP</span>
          <h1>Quiz ôn tập của bạn</h1>
          {setup && <p>{setup.moduleTitle}</p>}
        </div>
        <Link className="button" to={`/modules/${moduleId}/practice-quizzes/new`}>
          Tạo quiz ôn tập
        </Link>
      </div>
      <QuizErrorNotice error={error} />
      {!setup && !error && <p>Đang tải...</p>}
      {setup && setup.myQuizzes.length === 0 && (
        <p>Bạn chưa tạo quiz ôn tập nào cho module này.</p>
      )}
      {setup && setup.myQuizzes.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên quiz</th>
                <th>Số câu</th>
                <th>Thời gian</th>
                <th>Lượt đã làm</th>
                <th>Điểm cao nhất</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {setup.myQuizzes.map((quiz) => (
                <tr key={quiz.quizId}>
                  <td>{quiz.title}</td>
                  <td>{quiz.questionCount}</td>
                  <td>{quiz.durationMinutes} phút</td>
                  <td>
                    {quiz.attemptsUsed} / {quiz.maxAttempts}
                  </td>
                  <td>{quiz.bestScore === null ? '—' : `${formatScore(quiz.bestScore)} / 10`}</td>
                  <td>
                    <Link to={`/quizzes/${quiz.quizId}`}>
                      {quiz.inProgressAttemptId ? 'Tiếp tục làm' : 'Vào làm'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
