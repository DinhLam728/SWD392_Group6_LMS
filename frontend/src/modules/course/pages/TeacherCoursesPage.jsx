import { useCallback, useEffect, useState } from 'react'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Notice from '../components/Notice.jsx'
import Pagination, { ResultCount } from '../components/Pagination.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatDate } from '../components/formatDate.js'
import { formatVnd } from '../components/formatVnd.js'
import {
  deleteCourse,
  listMyCourses,
  publishCourse,
  unpublishCourse,
} from '../services/teacherCourseService.js'
import { clearFlash, peekFlash } from '../services/flash.js'

const PAGE_SIZE = 10
const DEFAULT_SORT = 'createdAt,desc'
const SORT_OPTIONS = [
  ['createdAt,desc', 'Newest first'],
  ['createdAt,asc', 'Oldest first'],
  ['title,asc', 'Title A–Z'],
  ['price,asc', 'Price: low to high'],
  ['price,desc', 'Price: high to low'],
]

const DIALOG_TEXT = {
  delete: {
    title: 'Delete course',
    confirmLabel: 'Delete',
    danger: true,
    message: (course) =>
      `Delete “${course.title}” together with all of its modules and lessons? This cannot be undone.`,
  },
  publish: {
    title: 'Publish course',
    confirmLabel: 'Publish',
    danger: false,
    message: (course) => `Publish “${course.title}”? Students will be able to see and register for it.`,
  },
  unpublish: {
    title: 'Unpublish course',
    confirmLabel: 'Unpublish',
    danger: false,
    message: (course) =>
      `Unpublish “${course.title}”? It will no longer be visible to students who have not registered.`,
  },
}

const ACTIONS = { delete: deleteCourse, publish: publishCourse, unpublish: unpublishCourse }
const DONE_MESSAGE = {
  delete: 'Course deleted.',
  publish: 'Course published.',
  unpublish: 'Course unpublished.',
}

export function TeacherCoursesPage() {
  const [keywordInput, setKeywordInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [sortInput, setSortInput] = useState(DEFAULT_SORT)
  const [filters, setFilters] = useState({ keyword: '', status: '', sort: DEFAULT_SORT })
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState(() => peekFlash() || '')
  const [dialog, setDialog] = useState(null)
  const [action, setAction] = useState({ busy: false, error: '' })

  useEffect(() => {
    clearFlash()
  }, [])

  const loader = useCallback(
    () => listMyCourses({ ...filters, page, size: PAGE_SIZE }),
    [filters, page],
  )
  const { data, error, loading, reload } = useRemoteData(
    `${filters.keyword}|${filters.status}|${filters.sort}|${page}`,
    loader,
  )
  const result = data?.data

  function applyFilters(event) {
    event.preventDefault()
    setPage(0)
    setFilters({ keyword: keywordInput.trim(), status: statusInput, sort: sortInput })
  }

  function resetFilters(event) {
    event.preventDefault()
    setKeywordInput('')
    setStatusInput('')
    setSortInput(DEFAULT_SORT)
    setPage(0)
    setFilters({ keyword: '', status: '', sort: DEFAULT_SORT })
  }

  function openDialog(type, course) {
    setAction({ busy: false, error: '' })
    setDialog({ type, course })
  }

  async function confirmDialog() {
    const { type, course } = dialog
    setAction({ busy: true, error: '' })
    try {
      await ACTIONS[type](course.courseId)
      setDialog(null)
      setAction({ busy: false, error: '' })
      setMessage(DONE_MESSAGE[type])
      if (type === 'delete' && page > 0 && result.items.length === 1) {
        setPage(page - 1)
      } else {
        reload()
      }
    } catch (failure) {
      setAction({ busy: false, error: failure.message || 'The action could not be completed.' })
    }
  }

  const text = dialog ? DIALOG_TEXT[dialog.type] : null

  return (
    <>
      <div className="page-heading tc-head">
        <div>
          <span className="eyebrow">TEACHER</span>
          <h1>My Courses</h1>
          <p>Manage your courses, modules and lessons.</p>
        </div>
        <a className="button" href="#/teacher/courses/new">
          + Create Course
        </a>
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error.message}</Notice>}

      <form className="filters" onSubmit={applyFilters} onReset={resetFilters}>
        <label>
          Search courses
          <input
            placeholder="Search by course title..."
            maxLength={150}
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
        </label>
        <label>
          Status
          <select value={statusInput} onChange={(event) => setStatusInput(event.target.value)}>
            <option value="">All statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </label>
        <label>
          Sort by
          <select value={sortInput} onChange={(event) => setSortInput(event.target.value)}>
            {SORT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Search</button>
          <button type="reset" className="button-secondary">
            Reset
          </button>
        </div>
      </form>

      {result && (
        <ResultCount
          page={result.page}
          size={result.size}
          totalElements={result.totalElements}
          noun="courses"
        />
      )}

      <div className="table-wrap" aria-busy={loading}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Course</th>
              <th>Modules</th>
              <th>Lessons</th>
              <th>Students</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((course, index) => (
              <tr key={course.courseId}>
                <td>{page * PAGE_SIZE + index + 1}</td>
                <td>
                  <div className="tc-course-cell">
                    {course.thumbnailUrl ? (
                      <img className="tc-thumb" src={course.thumbnailUrl} alt="" />
                    ) : (
                      <span className="tc-thumb">No image</span>
                    )}
                    <div>
                      <span>{course.title}</span>
                      <small>Created {formatDate(course.createdAt)}</small>
                    </div>
                  </div>
                </td>
                <td>{course.moduleCount}</td>
                <td>{course.lessonCount}</td>
                <td>{course.studentCount}</td>
                <td>{formatVnd(course.price)}</td>
                <td>
                  <StatusBadge status={course.status} />
                </td>
                <td>
                  <div className="tc-row-actions">
                    <a className="button button-secondary" href={`#/teacher/courses/${course.courseId}/content`}>
                      Content
                    </a>
                    <a className="button button-secondary" href={`#/teacher/courses/${course.courseId}/edit`}>
                      Edit
                    </a>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        openDialog(course.status === 'PUBLISHED' ? 'unpublish' : 'publish', course)
                      }
                    >
                      {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="button button-secondary tc-danger"
                      onClick={() => openDialog('delete', course)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && !result && <p className="tc-empty">Loading courses…</p>}
        {result && result.items.length === 0 && (
          <p className="tc-empty">
            {filters.keyword || filters.status
              ? 'No course matches your search.'
              : 'You have not created any course yet.'}
          </p>
        )}
      </div>

      {result && <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}

      {dialog && (
        <ConfirmDialog
          title={text.title}
          message={text.message(dialog.course)}
          confirmLabel={text.confirmLabel}
          danger={text.danger}
          busy={action.busy}
          error={action.error}
          onConfirm={confirmDialog}
          onCancel={() => setDialog(null)}
        />
      )}
    </>
  )
}
