import { BookOpen, ClipboardList, Plus, Minus } from 'lucide-react'

export default function CourseOutline({ modules }) {
  if (!modules.length) return <p>Nội dung khóa học đang được cập nhật.</p>

  return (
    <div className="course-outline">
      {modules.map((module) => (
        <details className="outline-module" key={module.moduleId}>
          <summary>
            <span className="module-number">
              {String(module.position).padStart(2, '0')}
            </span>
            <span className="module-heading">
              <strong>{module.title}</strong>
              <small>
                {module.lessons.length} bài học · {module.quizzes.length} bài
                quiz
              </small>
            </span>
            <Plus className="expand-icon" size={20} aria-hidden="true" />
            <Minus className="collapse-icon" size={20} aria-hidden="true" />
          </summary>
          <ul className="outline-items">
            {module.lessons.map((lesson) => (
              <li key={`lesson-${lesson.lessonId}`}>
                <BookOpen size={18} aria-hidden="true" />
                <span>{lesson.title}</span>
                <small>Bài học</small>
              </li>
            ))}
            {module.quizzes.map((quiz) => (
              <li key={`quiz-${quiz.quizId}`}>
                <ClipboardList size={18} aria-hidden="true" />
                <span>{quiz.title}</span>
                <small>Quiz</small>
              </li>
            ))}
            {!module.lessons.length && !module.quizzes.length && (
              <li>Nội dung đang được cập nhật.</li>
            )}
          </ul>
        </details>
      ))}
    </div>
  )
}
