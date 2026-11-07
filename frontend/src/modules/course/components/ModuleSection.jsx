const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`

function MoveButtons({ label, canMoveUp, canMoveDown, busy, onMove }) {
  return (
    <>
      <button
        type="button"
        className="button button-secondary tc-small tc-icon"
        aria-label={`Move ${label} up`}
        disabled={!canMoveUp || busy}
        onClick={() => onMove('UP')}
      >
        ▲
      </button>
      <button
        type="button"
        className="button button-secondary tc-small tc-icon"
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
  const quizCount = module.quizCount ?? 0
  return (
    <section className="card tc-module" aria-label={`Module ${moduleNumber}`}>
      <header className="tc-module-head">
        <span className="tc-module-number" aria-hidden="true">
          {moduleNumber}
        </span>
        <div className="tc-module-title">
          <h2>{module.title}</h2>
          <small>
            {plural(lessonCount, 'lesson', 'lessons')} · {plural(quizCount, 'practice quiz', 'practice quizzes')}
          </small>
        </div>
        <div className="tc-tools">
          <MoveButtons
            label={`module ${module.title}`}
            canMoveUp={moduleNumber > 1}
            canMoveDown={moduleNumber < moduleCount}
            busy={busy}
            onMove={(direction) => onMoveModule(module, direction)}
          />
          <button
            type="button"
            className="button button-secondary tc-small"
            onClick={() => onEditModule(module)}
          >
            Edit
          </button>
          <button
            type="button"
            className="button button-secondary tc-small tc-danger"
            onClick={() => onDeleteModule(module)}
          >
            Delete
          </button>
        </div>
      </header>

      <ul className="tc-lessons">
        {module.lessons.map((lesson, index) => (
          <li className="tc-lesson" key={lesson.lessonId}>
            <div className="tc-lesson-title">
              <span className="tc-lesson-number">
                {moduleNumber}.{index + 1}
              </span>
              <span>{lesson.title}</span>
              <span className={`status-badge ${lesson.hasContent ? 'status-active' : 'status-pending'}`}>
                {lesson.hasContent ? 'Text' : 'Empty'}
              </span>
            </div>
            <div className="tc-tools">
              <MoveButtons
                label={`lesson ${lesson.title}`}
                canMoveUp={index > 0}
                canMoveDown={index < lessonCount - 1}
                busy={busy}
                onMove={(direction) => onMoveLesson(lesson, direction)}
              />
              <a
                className="button button-secondary tc-small"
                href={`#/teacher/courses/${courseId}/lessons/${lesson.lessonId}/edit`}
              >
                Edit
              </a>
              <button
                type="button"
                className="button button-secondary tc-small tc-danger"
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
        <a
          className="button button-secondary tc-small"
          href={`#/teacher/courses/${courseId}/modules/${module.moduleId}/lessons/new`}
        >
          + Add Lesson
        </a>
      </div>
    </section>
  )
}
