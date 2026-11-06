import { useCallback, useEffect, useState } from 'react'
import { useRemoteData } from '../../../shared/hooks/useRemoteData.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Notice from '../components/Notice.jsx'
import Pagination from '../components/Pagination.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { formatVnd } from '../components/formatVnd.js'
import {
  deleteCourse,
  listMyCourses,
  publishCourse,
  unpublishCourse,
} from '../services/teacherCourseService.js'
import { clearFlash, peekFlash } from '../services/flash.js'

const PAGE_SIZE = 10

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
  const [filters, setFilters] = useState({ keyword: '', status: '' })
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
    `${filters.keyword}|${filters.status}|${page}`,
    loader,
  )
  const result = data?.data

  function applyFilters(event) {
    event.preventDefault()
    setPage(0)
    setFilters({ keyword: keywordInput.trim(), status: statusInput })
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
      <div className="tc-page-head">
        <h1>My Courses</h1>
        <p className="tc-subtitle">Manage your courses, modules and lessons</p>
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error.message}</Notice>}

      <form className="tc-toolbar" onSubmit={applyFilters}>
        <div className="tc-field tc-toolbar-search">
          <label htmlFor="tc-search">Search courses</label>
          <input
            id="tc-search"
            className="tc-input"
            placeholder="Search by course title..."
            maxLength={150}
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
        </div>
        <button type="submit" className="tc-btn">
          Search
        </button>
        <div className="tc-field">
          <label htmlFor="tc-status">Status</label>
          <select
            id="tc-status"
            className="tc-select"
            value={statusInput}
            onChange={(event) => setStatusInput(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>
        <span className="tc-toolbar-spacer" />
        <a className="tc-btn tc-btn-primary" href="#/teacher/courses/new">
          + Create Course
        </a>
      </form>

      <div className="tc-table-wrap" aria-busy={loading}>
        <table className="tc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Thumbnail</th>
              <th>Course Title</th>
              <th>Modules</th>
              <th>Lessons</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((course, index) => (
              <tr key={course.courseId}>
                <td className="tc-num">{page * PAGE_SIZE + index + 1}</td>
                <td>
                  {course.thumbnailUrl ? (
                    <img className="tc-thumb" src={course.thumbnailUrl} alt="" />
                  ) : (
                    <span className="tc-thumb">No image</span>
                  )}
                </td>
                <td>{course.title}</td>
                <td className="tc-num">{course.moduleCount}</td>
                <td className="tc-num">{course.lessonCount}</td>
                <td className="tc-num">{formatVnd(course.price)}</td>
                <td>
                  <StatusBadge status={course.status} />
                </td>
                <td>
                  <div className="tc-row-actions">
                    <a className="tc-btn tc-btn-small" href={`#/teacher/courses/${course.courseId}/edit`}>
                      Edit
                    </a>
                    <a className="tc-btn tc-btn-small" href={`#/teacher/courses/${course.courseId}/content`}>
                      Content
                    </a>
                    <button
                      type="button"
                      className="tc-btn tc-btn-small"
                      onClick={() =>
                        openDialog(course.status === 'PUBLISHED' ? 'unpublish' : 'publish', course)
                      }
                    >
                      {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className="tc-btn tc-btn-small tc-btn-danger"
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

      {result && (
        <Pagination
          page={result.page}
          size={result.size}
          totalElements={result.totalElements}
          totalPages={result.totalPages}
          noun="courses"
          onPageChange={setPage}
        />
      )}

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
