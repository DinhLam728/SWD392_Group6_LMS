import { useCallback, useEffect, useState } from 'react'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ModuleDialog from '../components/ModuleDialog.jsx'
import ModuleSection from '../components/ModuleSection.jsx'
import Notice from '../components/Notice.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  createModule,
  deleteLesson,
  deleteModule,
  getCourseContent,
  moveLesson,
  moveModule,
  updateModule,
} from '../services/teacherCourseService.js'
import { clearFlash, peekFlash } from '../services/flash.js'

export function CourseContentPage({ courseId }) {
  const [message, setMessage] = useState(() => peekFlash() || '')
  const [moving, setMoving] = useState(false)
  const [moveError, setMoveError] = useState('')
  // dialog: { type: 'module-form' | 'delete-module' | 'delete-lesson', module?, lesson? }
  const [dialog, setDialog] = useState(null)
  const [action, setAction] = useState({ busy: false, error: '' })

  useEffect(() => {
    clearFlash()
  }, [])

  const loader = useCallback(() => getCourseContent(courseId), [courseId])
  const { data, error, loading, reload } = useRemoteData(`content-${courseId}`, loader)
  const content = data?.data

  async function move(request) {
    setMoving(true)
    setMoveError('')
    try {
      await request()
      reload()
    } catch (failure) {
      setMoveError(failure.message || 'The order could not be changed.')
    } finally {
      setMoving(false)
    }
  }

  async function runDialogAction(request, doneMessage) {
    setAction({ busy: true, error: '' })
    try {
      await request()
      setDialog(null)
      setAction({ busy: false, error: '' })
      setMessage(doneMessage)
      reload()
    } catch (failure) {
      setAction({ busy: false, error: failure.message || 'The action could not be completed.' })
    }
  }

  function openDialog(next) {
    setAction({ busy: false, error: '' })
    setDialog(next)
  }

  return (
    <>
      <div className="tc-page-head">
        <h1>Course Content</h1>
        <p className="tc-breadcrumb">
          <a href="#/teacher/courses">My Courses</a> / <span>{content ? content.title : '…'}</span> /{' '}
          <span>Content</span>
          {content && <StatusBadge status={content.status} />}
        </p>
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error.message}</Notice>}
      {moveError && <Notice tone="error">{moveError}</Notice>}

      {content && (
        <div className="tc-toolbar">
          <p className="tc-subtitle">Use the arrows to change the order of modules and lessons.</p>
          <span className="tc-toolbar-spacer" />
          <button type="button" className="tc-btn tc-btn-primary" onClick={() => openDialog({ type: 'module-form' })}>
            + Add Module
          </button>
        </div>
      )}

      {loading && !content && <p className="tc-empty">Loading course content…</p>}

      {content && content.modules.length === 0 && (
        <p className="tc-empty">This course has no modules yet. Add the first module to start.</p>
      )}

      {content &&
        content.modules.map((module, index) => (
          <ModuleSection
            key={module.moduleId}
            courseId={courseId}
            module={module}
            moduleNumber={index + 1}
            moduleCount={content.modules.length}
            busy={moving}
            onMoveModule={(target, direction) => move(() => moveModule(target.moduleId, direction))}
            onEditModule={(target) => openDialog({ type: 'module-form', module: target })}
            onDeleteModule={(target) => openDialog({ type: 'delete-module', module: target })}
            onMoveLesson={(target, direction) => move(() => moveLesson(target.lessonId, direction))}
            onDeleteLesson={(target) => openDialog({ type: 'delete-lesson', lesson: target })}
          />
        ))}

      <div className="tc-actions">
        <a className="tc-btn" href="#/teacher/courses">
          Back to My Courses
        </a>
      </div>

      {dialog?.type === 'module-form' && (
        <ModuleDialog
          initialTitle={dialog.module?.title ?? ''}
          busy={action.busy}
          error={action.error}
          onCancel={() => setDialog(null)}
          onSubmit={(title) =>
            runDialogAction(
              () =>
                dialog.module
                  ? updateModule(dialog.module.moduleId, { title })
                  : createModule(courseId, { title }),
              dialog.module ? 'Module updated.' : 'Module added.',
            )
          }
        />
      )}

      {dialog?.type === 'delete-module' && (
        <ConfirmDialog
          title="Delete module"
          message={`Delete “${dialog.module.title}”? Its ${dialog.module.lessons.length} lesson(s) are deleted with it.`}
          confirmLabel="Delete"
          danger
          busy={action.busy}
          error={action.error}
          onCancel={() => setDialog(null)}
          onConfirm={() => runDialogAction(() => deleteModule(dialog.module.moduleId), 'Module deleted.')}
        />
      )}

      {dialog?.type === 'delete-lesson' && (
        <ConfirmDialog
          title="Delete lesson"
          message={`Delete the lesson “${dialog.lesson.title}”? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          busy={action.busy}
          error={action.error}
          onCancel={() => setDialog(null)}
          onConfirm={() => runDialogAction(() => deleteLesson(dialog.lesson.lessonId), 'Lesson deleted.')}
        />
      )}
    </>
  )
}
