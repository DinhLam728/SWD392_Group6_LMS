import { BookOpen, ClipboardList, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router'

export default function CourseOutline({ modules, courseId, canLearn = false }) {
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
              <small>{module.lessons.length} bài học</small>
            </span>
            <Plus className="expand-icon" size={20} aria-hidden="true" />
            <Minus className="collapse-icon" size={20} aria-hidden="true" />
          </summary>
          <ul className="outline-items">
            {module.lessons.map((lesson) => (
              <li key={`lesson-${lesson.lessonId}`}>
                <BookOpen size={18} aria-hidden="true" />
                {canLearn ? (
                  <Link to={`/courses/${courseId}/lessons/${lesson.lessonId}`}>
                    {lesson.title}
                  </Link>
                ) : (
                  <span>{lesson.title}</span>
                )}
                <small>Bài học</small>
              </li>
            ))}
            {canLearn && (
              <li>
                <ClipboardList size={18} aria-hidden="true" />
                <Link to={`/modules/${module.moduleId}/practice-quizzes`}>
                  Quiz ôn tập của bạn
                </Link>
                <small>{(module.quizzes || []).length} quiz</small>
              </li>
            )}
          </ul>
        </details>
      ))}
    </div>
  )
}
