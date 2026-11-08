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
  if (!trimmedTitle) errors.title = 'Lesson title is required.'
  else if (trimmedTitle.length > TITLE_MAX) errors.title = `Lesson title must be at most ${TITLE_MAX} characters.`
  const trimmedContent = content.trim()
  if (!trimmedContent) errors.content = 'Lesson content is required.'
  else if (trimmedContent.length > CONTENT_MAX) {
    errors.content = `Lesson content must be at most ${CONTENT_MAX} characters.`
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
        setFailure(error.message || 'The content could not be generated.')
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
        setFileError('Only PDF, TXT or MD files are supported.')
        return
      }
      if (contextFile.size > 5 * 1024 * 1024) {
        setFileError('The file must be at most 5MB.')
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
      setFlash(isEdit ? 'Lesson updated.' : 'Lesson added.')
      navigate(contentUrl)
    } catch (error) {
      setErrors(firstMessageByField(error.errors))
      setFailure(error.message || 'The lesson could not be saved.')
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
          <label>Order</label>
          <input value={context.order} readOnly aria-readonly="true" />
        </div>
      </div>

      <div className="tc-field">
        <label htmlFor={ids.title}>Lesson Title *</label>
        <input
          id={ids.title}
          placeholder="e.g. Introduction to Java classes"
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
          <label htmlFor={ids.content}>Lesson Content *</label>
          <button type="button" className="tc-ai" onClick={generate} disabled={busy}>
            {generating ? 'Generating content...' : 'Generate Content with AI'}
          </button>
        </div>
        {aiNotice && (
          <Notice tone="ai">
            AI draft generated from the lesson title{requestedFile.current ? ` and ${requestedFile.current.name}` : ''}. Review and edit it before saving.
          </Notice>
        )}
        <textarea
          id={ids.content}
          className="tc-textarea tc-textarea-lesson"
          placeholder="Write the lesson content, or generate a draft with AI..."
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
          {saving ? 'Saving…' : 'Save Lesson'}
        </button>
        <Link className="button button-secondary" to={`${contentUrl}`}>
          Cancel
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
          title="Generate Content with AI"
          onClose={() => setFileDialog(false)}
          footer={
            <>
              <button type="button" className="button button-secondary" onClick={() => setFileDialog(false)}>
                Cancel
              </button>
              <button type="button" className="button" onClick={confirmFile}>
                Generate
              </button>
            </>
          }
        >
          <p>Choose a context file (optional). Gemini will write the lesson based on its content.</p>
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
              <span>PDF, TXT, MD - max 5MB</span>
            </div>
          </div>
        </Dialog>
      )}

      {replaceDialog && (
        <ConfirmDialog
          title="Replace lesson content"
          message="Generating content replaces the text that is already in Lesson Content. Continue?"
          confirmLabel="Generate"
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
      <div className="breadcrumb" role="navigation" aria-label="Breadcrumb">
        <Link to="/teacher/courses">My Courses</Link>
        <span aria-hidden="true"> / </span>
        <span>Content</span>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{title}</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">TEACHER</span>
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
      <PageHead title="Add Lesson" />
      {error && <Notice tone="error">{error.message}</Notice>}
      {data && !module && <Notice tone="error">This module was not found in the course.</Notice>}
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
      <PageHead title="Edit Lesson" />
      {error && <Notice tone="error">{error.message}</Notice>}
      {wrongCourse && <Notice tone="error">This lesson does not belong to the course.</Notice>}
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
