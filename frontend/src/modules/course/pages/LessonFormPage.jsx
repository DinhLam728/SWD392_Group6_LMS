import { useCallback, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import AiUnavailableDialog from '../components/AiUnavailableDialog.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
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

// context: { courseId, moduleId, moduleTitle, order }; lesson: { lessonId, title, content } when editing.
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
  // Retry sends the title of the failed request again, even if the field was edited meanwhile.
  const requestedTitle = useRef('')
  const contentUrl = `/teacher/courses/${context.courseId}/content`

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function runGeneration(title) {
    requestedTitle.current = title
    setGenerating(true)
    setAiNotice(false)
    setAiDialog(false)
    setReplaceDialog(false)
    setFailure('')
    try {
      const response = await generateLessonContent({ moduleId: context.moduleId, title })
      setField('content', response.data.content)
      setErrors((current) => ({ ...current, content: undefined }))
      setAiNotice(true)
    } catch (error) {
      if (error.status === 502 || error.code === 'AI_SERVICE_UNAVAILABLE') {
        setAiDialog(true)
      } else {
        setErrors((current) => ({ ...current, ...firstMessageByField(error.errors) }))
        setFailure(error.message || 'The content could not be generated.')
      }
    } finally {
      setGenerating(false)
    }
  }

  function generate() {
    const found = validate({ title: values.title, content: 'x' })
    if (found.title) {
      setErrors((current) => ({ ...current, title: found.title }))
      return
    }
    setErrors((current) => ({ ...current, title: undefined }))
    if (values.content.trim()) {
      // A draft replaces the text, so ask before throwing away what the Teacher wrote.
      setReplaceDialog(true)
      return
    }
    runGeneration(values.title.trim())
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
    <form className="tc-form" onSubmit={save} noValidate>
      {failure && <Notice tone="error">{failure}</Notice>}

      <div className="tc-row">
        <div className="tc-field">
          <label>Module</label>
          <input className="tc-input" value={context.moduleTitle} readOnly aria-readonly="true" />
        </div>
        <div className="tc-field">
          <label>Order</label>
          <input className="tc-input" value={context.order} readOnly aria-readonly="true" />
        </div>
      </div>

      <div className="tc-field">
        <label htmlFor={ids.title}>Lesson Title *</label>
        <input
          id={ids.title}
          className="tc-input"
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
          <button type="button" className="tc-btn tc-btn-ai" onClick={generate} disabled={busy}>
            {generating ? 'Generating content...' : 'Generate Content with AI'}
          </button>
        </div>
        {aiNotice && (
          <Notice tone="ai">
            AI draft generated from the lesson title. Review and edit it before saving.
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
        <button type="submit" className="tc-btn tc-btn-primary" disabled={busy}>
          {saving ? 'Saving…' : 'Save Lesson'}
        </button>
        <Link className="tc-btn" to={`${contentUrl}`}>
          Cancel
        </Link>
      </div>

      {aiDialog && (
        <AiUnavailableDialog
          onRetry={() => runGeneration(requestedTitle.current)}
          onCancel={() => setAiDialog(false)}
        />
      )}

      {replaceDialog && (
        <ConfirmDialog
          title="Replace lesson content"
          message="Generating content replaces the text that is already in Lesson Content. Continue?"
          confirmLabel="Generate"
          onCancel={() => setReplaceDialog(false)}
          onConfirm={() => runGeneration(values.title.trim())}
        />
      )}
    </form>
  )
}

function PageHead({ title }) {
  return (
    <div className="tc-page-head">
      <h1>{title}</h1>
      <p className="tc-breadcrumb">
        <Link to="/teacher/courses">My Courses</Link> / <span>Content</span> / <span>{title}</span>
      </p>
    </div>
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
