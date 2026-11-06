import { Link } from 'react-router'
function MoveButtons({ label, canMoveUp, canMoveDown, busy, onMove }) {
  return (
    <>
      <button
        type="button"
        className="tc-btn tc-btn-small tc-btn-icon"
        aria-label={`Move ${label} up`}
        disabled={!canMoveUp || busy}
        onClick={() => onMove('UP')}
      >
        ▲
      </button>
      <button
        type="button"
        className="tc-btn tc-btn-small tc-btn-icon"
        aria-label={`Move ${label} down`}
        disabled={!canMoveDown || busy}
        onClick={() => onMove('DOWN')}
      >
        ▼
      </button>
    </>
  )
}

export default function ModuleSection({
  courseId,
  module,
  moduleNumber,
  moduleCount,
  busy,
  onMoveModule,
  onEditModule,
  onDeleteModule,
  onMoveLesson,
  onDeleteLesson,
}) {
  const lessonCount = module.lessons.length
  return (
    <section className="tc-module" aria-label={`Module ${moduleNumber}`}>
      <div className="tc-module-number" aria-hidden="true">
        {moduleNumber}
      </div>
      <div>
        <div className="tc-module-head">
          <h2>{module.title}</h2>
          <div className="tc-module-tools">
            <MoveButtons
              label={`module ${module.title}`}
              canMoveUp={moduleNumber > 1}
              canMoveDown={moduleNumber < moduleCount}
              busy={busy}
              onMove={(direction) => onMoveModule(module, direction)}
            />
            <button type="button" className="tc-btn tc-btn-small" onClick={() => onEditModule(module)}>
              Edit
            </button>
            <button
              type="button"
              className="tc-btn tc-btn-small tc-btn-danger"
              onClick={() => onDeleteModule(module)}
            >
              Delete
            </button>
          </div>
        </div>

        <ul className="tc-lessons">
          {module.lessons.map((lesson, index) => (
            <li className="tc-lesson" key={lesson.lessonId}>
              <div className="tc-lesson-title">
                <span className="tc-lesson-number">
                  {moduleNumber}.{index + 1}
                </span>
                <span>{lesson.title}</span>
                <span className="tc-badge tc-badge-quiet">{lesson.hasContent ? 'Text' : 'Empty'}</span>
              </div>
              <div className="tc-module-tools">
                <MoveButtons
                  label={`lesson ${lesson.title}`}
                  canMoveUp={index > 0}
                  canMoveDown={index < lessonCount - 1}
                  busy={busy}
                  onMove={(direction) => onMoveLesson(lesson, direction)}
                />
                <Link
                  className="tc-btn tc-btn-small"
                  to={`/teacher/courses/${courseId}/lessons/${lesson.lessonId}/edit`}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="tc-btn tc-btn-small tc-btn-danger"
                  onClick={() => onDeleteLesson(lesson)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="tc-add-lesson">
          {lessonCount === 0 && <span>No lessons yet.</span>}
          <Link
            className="tc-btn tc-btn-small"
            to={`/teacher/courses/${courseId}/modules/${module.moduleId}/lessons/new`}
          >
            + Add Lesson
          </Link>
        </div>
      </div>
    </section>
  )
}
