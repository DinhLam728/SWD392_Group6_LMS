import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCourse, getCourseLesson } from '../services/courseService.js'

export default function LessonLearningPage() {
  const { courseId, lessonId } = useParams()
  if (!/^\d+$/.test(courseId) || !/^\d+$/.test(lessonId)) {
    return <p>Không tìm thấy trang.</p>
  }
  return (
    <LessonLearningContent
      key={courseId}
      courseId={courseId}
      lessonId={lessonId}
    />
  )
}

function LessonLearningContent({ courseId, lessonId }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getCourse(courseId, controller.signal)
      .then(({ data }) => setDetail(data))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    return () => controller.abort()
  }, [courseId])

  const lessons = detail
    ? detail.modules.flatMap((module) => module.lessons)
    : []
  const index = lessons.findIndex(
    (lesson) => String(lesson.lessonId) === lessonId,
  )
  const previous = index > 0 ? lessons[index - 1] : null
  const next = index >= 0 ? lessons[index + 1] : null
  const lessonUrl = (id) => `/courses/${courseId}/lessons/${id}`

  return (
    <>
      <div
        className="breadcrumb registration-breadcrumb"
        aria-label="Đường dẫn trang"
      >
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/courses/${courseId}`}>
          {detail?.course.title ?? 'Chi tiết khóa học'}
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Bài học</span>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="two-columns lesson-layout">
        <article className="card lesson-article">
          <LessonBody key={lessonId} courseId={courseId} lessonId={lessonId} />
          {(previous || next) && (
            <nav className="lesson-pager" aria-label="Chuyển bài học">
              {previous ? (
                <Link className="button button-secondary" to={lessonUrl(previous.lessonId)}>
                  <ChevronLeft size={16} aria-hidden="true" />
                  Bài trước
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link className="button" to={lessonUrl(next.lessonId)}>
                  Bài tiếp theo
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              )}
            </nav>
          )}
        </article>
        {detail && (
          <aside className="card lesson-sidebar">
            <span className="eyebrow">NỘI DUNG KHÓA HỌC</span>
            {detail.modules.map((module) => (
              <section className="lesson-sidebar-module" key={module.moduleId}>
                <strong>
                  {String(module.position).padStart(2, '0')} · {module.title}
                </strong>
                <ul>
                  {module.lessons.map((lesson) => {
                    const current = String(lesson.lessonId) === lessonId
                    return (
                      <li key={lesson.lessonId}>
                        <Link
                          className={current ? 'active' : undefined}
                          aria-current={current ? 'page' : undefined}
                          to={lessonUrl(lesson.lessonId)}
                        >
                          <BookOpen size={16} aria-hidden="true" />
                          <span>{lesson.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </aside>
        )}
      </div>
    </>
  )
}

function LessonBody({ courseId, lessonId }) {
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    window.scrollTo({ top: 0 })
    const controller = new AbortController()
    getCourseLesson(courseId, lessonId, controller.signal)
      .then(({ data }) => setLesson(data))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    return () => controller.abort()
  }, [courseId, lessonId])

  if (error) {
    return (
      <div className="lesson-error">
        <p role="alert">{error}</p>
        <Link className="button" to={`/courses/${courseId}`}>
          Về trang khóa học
        </Link>
      </div>
    )
  }
  if (!lesson) return <p>Đang tải bài học...</p>
  return (
    <>
      <span className="eyebrow">{lesson.moduleTitle}</span>
      <h1>{lesson.title}</h1>
      {lesson.content?.trim() ? (
        <div className="lesson-content">{lesson.content}</div>
      ) : (
        <p className="lesson-empty">Bài học này chưa có nội dung.</p>
      )}
    </>
  )
}
