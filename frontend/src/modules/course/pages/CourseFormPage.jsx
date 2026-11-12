import { useCallback, useEffect, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import Notice from '../components/Notice.jsx'
import { createCourse, getCourse, updateCourse, uploadCourseImage } from '../services/teacherCourseService.js'
import { courseImageUrl } from '../utils/courseImageUrl.js'
import { firstMessageByField } from '../services/fieldErrors.js'
import { setFlash } from '../services/flash.js'

function validate(values) {
  const errors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Tên khóa học không được để trống.'
  else if (title.length > 150) errors.title = 'Tên khóa học tối đa 150 ký tự.'
  const description = values.description.trim()
  if (!description) errors.description = 'Mô tả không được để trống.'
  else if (description.length > 2000) errors.description = 'Mô tả tối đa 2000 ký tự.'
  if (!/^\d+$/.test(values.price.trim()) || Number(values.price) < 1) {
    errors.price = 'Giá phải là số nguyên từ 1 trở lên.'
  }
  if (values.thumbnailUrl.trim().length > 500) errors.thumbnailUrl = 'Đường dẫn ảnh tối đa 500 ký tự.'
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
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage.preview)
  }, [selectedImage])

  function selectImage(event) {
    const file = event.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, thumbnailUrl: 'Chọn ảnh JPG hoặc PNG, tối đa 5MB.' }))
      event.target.value = ''
      return
    }
    setErrors((current) => ({ ...current, thumbnailUrl: '' }))
    setSelectedImage({ file, preview: URL.createObjectURL(file) })
  }

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
      if (selectedImage) {
        const { data } = await uploadCourseImage(selectedImage.file)
        body.thumbnailUrl = data.thumbnailUrl
        setField('thumbnailUrl', data.thumbnailUrl)
        setSelectedImage(null)
      }
      await (isEdit ? updateCourse(course.courseId, body) : createCourse(body))
      setFlash(isEdit ? 'Đã cập nhật khóa học.' : 'Đã lưu khóa học dưới dạng bản nháp.')
      navigate('/teacher/courses')
    } catch (error) {
      setErrors(firstMessageByField(error.errors))
      setFailure(error.message || 'Không thể lưu khóa học.')
      setSaving(false)
    }
  }

  return (
    <form className="card tc-form" onSubmit={submit} noValidate>
      {failure && <Notice tone="error">{failure}</Notice>}

      <div className="tc-field">
        <label htmlFor={ids.title}>Tên khóa học *</label>
        <input
          id={ids.title}
          placeholder="Ví dụ: Lập trình Java cơ bản"
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
        <label htmlFor={ids.description}>Mô tả *</label>
        <textarea
          id={ids.description}
          className="tc-textarea"
          placeholder="Mô tả những điều học viên sẽ học được..."
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
        <label htmlFor={ids.price}>Giá (VND) *</label>
        <input
          id={ids.price}
          inputMode="numeric"
          placeholder="Ví dụ: 500000"
          value={values.price}
          aria-invalid={Boolean(errors.price)}
          onChange={(event) => setField('price', event.target.value)}
        />
        <span className="tc-field-error">{errors.price}</span>
      </div>

      <div className="tc-field">
        <label htmlFor={ids.thumbnail}>Ảnh khóa học</label>
        <div className="tc-thumb-row">
          {selectedImage || values.thumbnailUrl.trim() ? (
            <img className="tc-thumb" src={selectedImage?.preview || courseImageUrl(values.thumbnailUrl.trim())} alt="Xem trước ảnh khóa học" />
          ) : (
            <span className="tc-thumb">Chưa có ảnh</span>
          )}
          <input
            id={ids.thumbnail}
            type="file"
            accept="image/jpeg,image/png"
            disabled={saving}
            aria-invalid={Boolean(errors.thumbnailUrl)}
            onChange={selectImage}
          />
        </div>
        <small>JPG hoặc PNG, tối đa 5MB và 4096 × 4096 pixel. Ảnh được upload khi lưu khóa học.</small>
        <label htmlFor={ids.thumbnail + '-url'}>Hoặc dùng đường dẫn ảnh</label>
        <input
          id={ids.thumbnail + '-url'}
          placeholder="https://…"
          value={values.thumbnailUrl}
          disabled={saving}
          onChange={(event) => {
            setSelectedImage(null)
            setField('thumbnailUrl', event.target.value)
          }}
        />
        <span className="tc-field-error">{errors.thumbnailUrl}</span>
      </div>

      <div className="tc-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Lưu bản nháp'}
        </button>
        <Link className="button button-secondary" to="/teacher/courses">
          Hủy
        </Link>
      </div>
    </form>
  )
}

function PageHead({ title }) {
  return (
    <>
      <div className="breadcrumb" role="navigation" aria-label="Đường dẫn">
        <Link to="/teacher/courses">Khóa học của tôi</Link>
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

function EditCourse({ courseId }) {
  const loader = useCallback(() => getCourse(courseId), [courseId])
  const { data, error } = useRemoteData(`course-${courseId}`, loader)
  return (
    <>
      <PageHead title="Sửa khóa học" />
      {error && <Notice tone="error">{error.message}</Notice>}
      {data && <CourseForm key={data.data.courseId} course={data.data} />}
    </>
  )
}

export function CourseFormPage({ courseId = null }) {
  if (courseId !== null) return <EditCourse courseId={courseId} />
  return (
    <>
      <PageHead title="Tạo khóa học" />
      <CourseForm />
    </>
  )
}
