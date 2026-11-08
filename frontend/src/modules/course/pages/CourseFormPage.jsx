import { useCallback, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import Notice from '../components/Notice.jsx'
import { createCourse, getCourse, updateCourse } from '../services/teacherCourseService.js'
import { firstMessageByField } from '../services/fieldErrors.js'
import { setFlash } from '../services/flash.js'

function validate(values) {
  const errors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Course title is required.'
  else if (title.length > 150) errors.title = 'Course title must be at most 150 characters.'
  const description = values.description.trim()
  if (!description) errors.description = 'Description is required.'
  else if (description.length > 2000) errors.description = 'Description must be at most 2000 characters.'
  if (!/^\d+$/.test(values.price.trim()) || Number(values.price) < 1) {
    errors.price = 'Price must be a whole number of 1 or more.'
  }
  if (values.thumbnailUrl.trim().length > 500) errors.thumbnailUrl = 'Image URL must be at most 500 characters.'
  return errors
}

function CourseForm({ course }) {
  const navigate = useNavigate()
  const ids = { title: useId(), description: useId(), price: useId(), thumbnail: useId() }
  const isEdit = Boolean(course)
  const [values, setValues] = useState({
    title: course?.title ?? '',
    description: course?.description ?? '',
    price: course ? String(Math.trunc(Number(course.price))) : '',
    thumbnailUrl: course?.thumbnailUrl ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState('')

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setFailure('')
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    const body = {
      title: values.title.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      thumbnailUrl: values.thumbnailUrl.trim() || null,
    }
    setSaving(true)
    try {
      await (isEdit ? updateCourse(course.courseId, body) : createCourse(body))
      setFlash(isEdit ? 'Course updated.' : 'Course saved as draft.')
      navigate('/teacher/courses')
    } catch (error) {
      setErrors(firstMessageByField(error.errors))
      setFailure(error.message || 'The course could not be saved.')
      setSaving(false)
    }
  }

  return (
    <form className="card tc-form" onSubmit={submit} noValidate>
      {failure && <Notice tone="error">{failure}</Notice>}

      <div className="tc-field">
        <label htmlFor={ids.title}>Course Title *</label>
        <input
          id={ids.title}
          placeholder="e.g. Java Programming Basics"
          value={values.title}
          aria-invalid={Boolean(errors.title)}
          onChange={(event) => setField('title', event.target.value)}
        />
        <div className="tc-field-meta">
          <span className="tc-field-error">{errors.title}</span>
          <span>{values.title.length} / 150</span>
        </div>
      </div>

      <div className="tc-field">
        <label htmlFor={ids.description}>Description *</label>
        <textarea
          id={ids.description}
          className="tc-textarea"
          placeholder="Describe what students will learn..."
          value={values.description}
          aria-invalid={Boolean(errors.description)}
          onChange={(event) => setField('description', event.target.value)}
        />
        <div className="tc-field-meta">
          <span className="tc-field-error">{errors.description}</span>
          <span>{values.description.length} / 2000</span>
        </div>
      </div>

      <div className="tc-field tc-form-narrow">
        <label htmlFor={ids.price}>Price (VND) *</label>
        <input
          id={ids.price}
          inputMode="numeric"
          placeholder="e.g. 500000"
          value={values.price}
          aria-invalid={Boolean(errors.price)}
          onChange={(event) => setField('price', event.target.value)}
        />
        <span className="tc-field-error">{errors.price}</span>
      </div>

      <div className="tc-field">
        <label htmlFor={ids.thumbnail}>Thumbnail image URL</label>
        <div className="tc-thumb-row">
          {values.thumbnailUrl.trim() ? (
            <img className="tc-thumb" src={values.thumbnailUrl.trim()} alt="Thumbnail preview" />
          ) : (
            <span className="tc-thumb">No image</span>
          )}
          <input
            id={ids.thumbnail}
            placeholder="https://…"
            value={values.thumbnailUrl}
            aria-invalid={Boolean(errors.thumbnailUrl)}
            onChange={(event) => setField('thumbnailUrl', event.target.value)}
          />
        </div>
        <span className="tc-field-error">{errors.thumbnailUrl}</span>
      </div>

      <div className="tc-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save as Draft'}
        </button>
        <Link className="button button-secondary" to="/teacher/courses">
          Cancel
        </Link>
      </div>
    </form>
  )
}

function PageHead({ title }) {
  return (
    <>
      <div className="breadcrumb" role="navigation" aria-label="Breadcrumb">
        <Link to="/teacher/courses">My Courses</Link>
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

function EditCourse({ courseId }) {
  const loader = useCallback(() => getCourse(courseId), [courseId])
  const { data, error } = useRemoteData(`course-${courseId}`, loader)
  return (
    <>
      <PageHead title="Edit Course" />
      {error && <Notice tone="error">{error.message}</Notice>}
      {data && <CourseForm key={data.data.courseId} course={data.data} />}
    </>
  )
}

export function CourseFormPage({ courseId = null }) {
  if (courseId !== null) return <EditCourse courseId={courseId} />
  return (
    <>
      <PageHead title="Create Course" />
      <CourseForm />
    </>
  )
}
