import { Link } from 'react-router'
import { courseImageUrl } from '../utils/courseImageUrl.js'
import { useCallback, useEffect, useState } from 'react'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ModuleDialog from '../components/ModuleDialog.jsx'
import ModuleSection from '../components/ModuleSection.jsx'
import Notice from '../components/Notice.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate } from '../components/formatDate.js'
import { formatVnd } from '../components/formatVnd.js'
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
      setMoveError(failure.message || 'Không thể thay đổi thứ tự.')
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
      setAction({ busy: false, error: failure.message || 'Không thể thực hiện thao tác này.' })
    }
  }

  function openDialog(next) {
    setAction({ busy: false, error: '' })
    setDialog(next)
  }

  const lessonTotal = content ? content.modules.reduce((sum, module) => sum + module.lessons.length, 0) : 0

  return (
    <>
      <div className="breadcrumb" role="navigation" aria-label="Đường dẫn">
        <Link to="/teacher/courses">Khóa học của tôi</Link>
        <span aria-hidden="true"> / </span>
        <span>{content ? content.title : '…'}</span>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Nội dung</span>
      </div>

      <div className="page-heading tc-head">
        <div>
          <span className="eyebrow">GIÁO VIÊN</span>
          <h1>Nội dung khóa học</h1>
          <p>Dùng các mũi tên để thay đổi thứ tự module và bài học.</p>
        </div>
        {content && (
          <button type="button" onClick={() => openDialog({ type: 'module-form' })}>
            + Thêm module
          </button>
        )}
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error.message}</Notice>}
      {moveError && <Notice tone="error">{moveError}</Notice>}

      {content && (
        <section className="card tc-summary" aria-label="Thông tin khóa học">
          {content.thumbnailUrl ? (
            <img className="tc-summary-cover" src={courseImageUrl(content.thumbnailUrl)} alt="" />
          ) : (
            <span className="tc-summary-cover">Chưa có ảnh</span>
          )}
          <div>
            <div className="tc-summary-title">
              <h2>{content.title}</h2>
              <StatusBadge status={content.status} />
            </div>
            {content.description && <p className="tc-summary-text">{content.description}</p>}
            <dl className="tc-stats">
              <div>
                <dt>Giá</dt>
                <dd>{formatVnd(content.price)}</dd>
              </div>
              <div>
                <dt>Module</dt>
                <dd>{content.modules.length}</dd>
              </div>
              <div>
                <dt>Bài học</dt>
                <dd>{lessonTotal}</dd>
              </div>
              <div>
                <dt>Học viên</dt>
                <dd>{content.studentCount}</dd>
              </div>
              <div>
                <dt>Câu hỏi</dt>
                <dd>{content.questionCount}</dd>
              </div>
              <div>
                <dt>Ngày tạo</dt>
                <dd>{formatDate(content.createdAt)}</dd>
              </div>
            </dl>
            <div className="tc-actions">
              <Link className="button button-secondary tc-small" to={`/teacher/courses/${courseId}/edit`}>
                Sửa khóa học
              </Link>
              <Link className="button button-secondary tc-small" to="/question-bank">
                Ngân hàng câu hỏi
              </Link>
            </div>
          </div>
        </section>
      )}

      {loading && !content && <p className="tc-empty">Đang tải nội dung khóa học…</p>}

      {content && content.modules.length === 0 && (
        <p className="tc-empty">Khóa học chưa có module nào. Hãy thêm module đầu tiên để bắt đầu.</p>
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
        <Link className="button button-secondary" to="/teacher/courses">
          Quay lại Khóa học của tôi
        </Link>
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
              dialog.module ? 'Đã cập nhật module.' : 'Đã thêm module.',
            )
          }
        />
      )}

      {dialog?.type === 'delete-module' && (
        <ConfirmDialog
          title="Xóa module"
          message={`Xóa module “${dialog.module.title}”? Module chỉ được xóa khi không còn bài học, câu hỏi hoặc quiz liên quan. Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa"
          danger
          busy={action.busy}
          error={action.error}
          onCancel={() => setDialog(null)}
          onConfirm={() => runDialogAction(() => deleteModule(dialog.module.moduleId), 'Đã xóa module.')}
        />
      )}

      {dialog?.type === 'delete-lesson' && (
        <ConfirmDialog
          title="Xóa bài học"
          message={`Xóa bài học “${dialog.lesson.title}”? Bài học chỉ được xóa khi khóa học chưa có học viên đăng ký. Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa"
          danger
          busy={action.busy}
          error={action.error}
          onCancel={() => setDialog(null)}
          onConfirm={() => runDialogAction(() => deleteLesson(dialog.lesson.lessonId), 'Đã xóa bài học.')}
        />
      )}
    </>
  )
}
