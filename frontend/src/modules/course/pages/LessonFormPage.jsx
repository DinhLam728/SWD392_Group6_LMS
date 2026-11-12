import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import AiUnavailableDialog from '../components/AiUnavailableDialog.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Dialog from '../components/Dialog.jsx'
import Notice from '../components/Notice.jsx'
import { firstMessageByField } from '../services/fieldErrors.js'
import { setFlash } from '../services/flash.js'
import {
  createLesson,
  generateLessonContent,
  getCourseContent,
  getLesson,
  updateLesson,
} from '../services/teacherCourseService.js'

const TITLE_MAX = 150
const CONTENT_MAX = 16000

function validate({ title, content }) {
  const errors = {}
  const trimmedTitle = title.trim()
  if (!trimmedTitle) errors.title = 'Tiêu đề bài học không được để trống.'
  else if (trimmedTitle.length > TITLE_MAX) errors.title = `Tiêu đề bài học tối đa ${TITLE_MAX} ký tự.`
  const trimmedContent = content.trim()
  if (!trimmedContent) errors.content = 'Nội dung bài học không được để trống.'
  else if (trimmedContent.length > CONTENT_MAX) {
    errors.content = `Nội dung bài học tối đa ${CONTENT_MAX} ký tự.`
  }
  return errors
}

function LessonForm({ context, lesson }) {
  const navigate = useNavigate()
  const ids = { title: useId(), content: useId() }
  const isEdit = Boolean(lesson)
  const [values, setValues] = useState({ title: lesson?.title ?? '', content: lesson?.content ?? '' })
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiNotice, setAiNotice] = useState(false)
  const [aiDialog, setAiDialog] = useState(false)
  const [replaceDialog, setReplaceDialog] = useState(false)
  const [fileDialog, setFileDialog] = useState(false)
  const [contextFile, setContextFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const requestedTitle = useRef('')
  const requestedFile = useRef(null)
  const pending = useRef(null)
  const contentUrl = `/teacher/courses/${context.courseId}/content`

  useEffect(() => () => pending.current?.abort(), [])

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function runGeneration(title, file) {
    requestedTitle.current = title
    requestedFile.current = file
    pending.current?.abort()
    const request = new AbortController()
    pending.current = request
    setGenerating(true)
    setAiNotice(false)
    setAiDialog(false)
    setReplaceDialog(false)
    setFailure('')
    try {
      const fileData = file
        ? await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result.split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        : null
      const response = await generateLessonContent(
        { moduleId: context.moduleId, title, fileName: file?.name ?? null, fileData },
        request.signal,
      )
      setField('content', response.data.content)
      setErrors((current) => ({ ...current, content: undefined }))
      setAiNotice(true)
    } catch (error) {
      if (request.signal.aborted) {
        return
      }
      if (error.status === 502 || error.code === 'AI_SERVICE_UNAVAILABLE') {
        setAiDialog(true)
      } else {
        setErrors((current) => ({ ...current, ...firstMessageByField(error.errors) }))
        setFailure(error.message || 'Không thể tạo nội dung.')
      }
    } finally {
      if (!request.signal.aborted) {
        setGenerating(false)
      }
    }
  }

  function generate() {
    const found = validate({ title: values.title, content: 'x' })
    if (found.title) {
      setErrors((current) => ({ ...current, title: found.title }))
      return
    }
    setErrors((current) => ({ ...current, title: undefined }))
    setFileError('')
    setContextFile(null)
    setFileDialog(true)
  }

  function confirmFile() {
    if (contextFile) {
      if (!/.(pdf|txt|md)$/i.test(contextFile.name)) {
        setFileError('Chỉ hỗ trợ file PDF, TXT hoặc MD.')
        return
      }
      if (contextFile.size > 5 * 1024 * 1024) {
        setFileError('File không được vượt quá 5MB.')
        return
      }
    }
    setFileDialog(false)
    if (values.content.trim()) {
      setReplaceDialog(true)
      return
    }
    runGeneration(values.title.trim(), contextFile)
  }

  async function save(event) {
    event.preventDefault()
    setFailure('')
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    const body = { title: values.title.trim(), content: values.content.trim() }
    setSaving(true)
    try {
      await (isEdit ? updateLesson(lesson.lessonId, body) : createLesson(context.moduleId, body))
      setFlash(isEdit ? 'Đã cập nhật bài học.' : 'Đã thêm bài học.')
      navigate(contentUrl)
    } catch (error) {
      setErrors(firstMessageByField(error.errors))
      setFailure(error.message || 'Không thể lưu bài học.')
      setSaving(false)
    }
  }

  const busy = saving || generating

  return (
    <form className="card tc-form" onSubmit={save} noValidate>
      {failure && <Notice tone="error">{failure}</Notice>}

      <div className="tc-row">
        <div className="tc-field">
          <label>Module</label>
          <input value={context.moduleTitle} readOnly aria-readonly="true" />
        </div>
        <div className="tc-field">
          <label>Thứ tự</label>
          <input value={context.order} readOnly aria-readonly="true" />
        </div>
      </div>

      <div className="tc-field">
        <label htmlFor={ids.title}>Tiêu đề bài học *</label>
        <input
          id={ids.title}
          placeholder="Ví dụ: Giới thiệu về lớp trong Java"
          value={values.title}
          aria-invalid={Boolean(errors.title)}
          onChange={(event) => setField('title', event.target.value)}
        />
        <div className="tc-field-meta">
          <span className="tc-field-error">{errors.title}</span>
          <span>
            {values.title.length} / {TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="tc-field">
        <div className="tc-label-row">
          <label htmlFor={ids.content}>Nội dung bài học *</label>
          <button type="button" className="tc-ai" onClick={generate} disabled={busy}>
            {generating ? 'Đang tạo nội dung...' : 'Tạo nội dung bằng AI'}
          </button>
        </div>
        {aiNotice && (
          <Notice tone="ai">
            Bản nháp AI được tạo từ tiêu đề bài học{requestedFile.current ? ` và file ${requestedFile.current.name}` : ''}. Hãy xem lại và chỉnh sửa trước khi lưu.
          </Notice>
        )}
        <textarea
          id={ids.content}
          className="tc-textarea tc-textarea-lesson"
          placeholder="Viết nội dung bài học hoặc tạo bản nháp bằng AI..."
          value={values.content}
          readOnly={generating}
          aria-busy={generating}
          aria-invalid={Boolean(errors.content)}
          onChange={(event) => setField('content', event.target.value)}
        />
        <div className="tc-field-meta">
          <span className="tc-field-error">{errors.content}</span>
          <span>
            {values.content.length} / {CONTENT_MAX}
          </span>
        </div>
      </div>

      <div className="tc-actions">
        <button type="submit" disabled={busy}>
          {saving ? 'Đang lưu…' : 'Lưu bài học'}
        </button>
        <Link className="button button-secondary" to={`${contentUrl}`}>
          Hủy
        </Link>
      </div>

      {aiDialog && (
        <AiUnavailableDialog
          onRetry={() => runGeneration(requestedTitle.current, requestedFile.current)}
          onCancel={() => setAiDialog(false)}
        />
      )}

      {fileDialog && (
        <Dialog
          title="Tạo nội dung bằng AI"
          onClose={() => setFileDialog(false)}
          footer={
            <>
              <button type="button" className="button button-secondary" onClick={() => setFileDialog(false)}>
                Hủy
              </button>
              <button type="button" className="button" onClick={confirmFile}>
                Tạo nội dung
              </button>
            </>
          }
        >
          <p>Chọn file ngữ cảnh (không bắt buộc). Gemini sẽ viết bài học dựa trên nội dung file.</p>
          <div className="tc-field" style={{ marginTop: '0.8rem' }}>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={(event) => {
                setContextFile(event.target.files[0] ?? null)
                setFileError('')
              }}
            />
            <div className="tc-field-meta">
              <span className="tc-field-error">{fileError}</span>
              <span>PDF, TXT, MD - tối đa 5MB</span>
            </div>
          </div>
        </Dialog>
      )}

      {replaceDialog && (
        <ConfirmDialog
          title="Thay thế nội dung bài học"
          message="Việc tạo nội dung sẽ thay thế văn bản hiện có trong phần Nội dung bài học. Bạn có muốn tiếp tục?"
          confirmLabel="Tạo nội dung"
          onCancel={() => setReplaceDialog(false)}
          onConfirm={() => runGeneration(values.title.trim(), contextFile)}
        />
      )}
    </form>
  )
}

function PageHead({ title }) {
  return (
    <>
      <div className="breadcrumb" role="navigation" aria-label="Đường dẫn">
        <Link to="/teacher/courses">Khóa học của tôi</Link>
        <span aria-hidden="true"> / </span>
        <span>Nội dung</span>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{title}</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">GIÁO VIÊN</span>
        <h1>{title}</h1>
      </div>
    </>
  )
}

function NewLesson({ courseId, moduleId }) {
  const loader = useCallback(() => getCourseContent(courseId), [courseId])
  const { data, error } = useRemoteData(`lesson-new-${courseId}`, loader)
  const module = data?.data.modules.find((item) => item.moduleId === moduleId)
  return (
    <>
      <PageHead title="Thêm bài học" />
      {error && <Notice tone="error">{error.message}</Notice>}
      {data && !module && <Notice tone="error">Không tìm thấy module này trong khóa học.</Notice>}
      {module && (
        <LessonForm
          key={moduleId}
          context={{
            courseId,
            moduleId,
            moduleTitle: module.title,
            order: module.lessons.length + 1,
          }}
        />
      )}
    </>
  )
}

function EditLesson({ courseId, lessonId }) {
  const loader = useCallback(() => getLesson(lessonId), [lessonId])
  const { data, error } = useRemoteData(`lesson-${lessonId}`, loader)
  const lesson = data?.data
  const wrongCourse = lesson && lesson.courseId !== courseId
  return (
    <>
      <PageHead title="Sửa bài học" />
      {error && <Notice tone="error">{error.message}</Notice>}
      {wrongCourse && <Notice tone="error">Bài học này không thuộc khóa học.</Notice>}
      {lesson && !wrongCourse && (
        <LessonForm
          key={lessonId}
          lesson={lesson}
          context={{
            courseId,
            moduleId: lesson.moduleId,
            moduleTitle: lesson.moduleTitle,
            order: lesson.position,
          }}
        />
      )}
    </>
  )
}

export function LessonFormPage({ courseId, moduleId = null, lessonId = null }) {
  if (lessonId !== null) return <EditLesson courseId={courseId} lessonId={lessonId} />
  return <NewLesson courseId={courseId} moduleId={moduleId} />
}
