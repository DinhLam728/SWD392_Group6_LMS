import { Link } from 'react-router'
import { courseImageUrl } from '../utils/courseImageUrl.js'
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
  ['createdAt,desc', 'Mới nhất'],
  ['createdAt,asc', 'Cũ nhất'],
  ['title,asc', 'Tên A–Z'],
  ['price,asc', 'Giá: thấp đến cao'],
  ['price,desc', 'Giá: cao đến thấp'],
]

const DIALOG_TEXT = {
  delete: {
    title: 'Xóa khóa học',
    confirmLabel: 'Xóa',
    danger: true,
    message: (course) =>
      `Xóa khóa học “${course.title}” cùng toàn bộ module và bài học? Khóa học chỉ được xóa khi không còn lượt đăng ký, câu hỏi hoặc quiz liên quan. Thao tác này không thể hoàn tác.`,
  },
  publish: {
    title: 'Xuất bản khóa học',
    confirmLabel: 'Xuất bản',
    danger: false,
    message: (course) => `Xuất bản khóa học “${course.title}”? Học viên sẽ thấy và có thể đăng ký khóa học này.`,
  },
  unpublish: {
    title: 'Hủy xuất bản khóa học',
    confirmLabel: 'Hủy xuất bản',
    danger: false,
    message: (course) =>
      `Hủy xuất bản khóa học “${course.title}”? Học viên chưa đăng ký sẽ không còn nhìn thấy khóa học này.`,
  },
}

const ACTIONS = { delete: deleteCourse, publish: publishCourse, unpublish: unpublishCourse }
const DONE_MESSAGE = {
  delete: 'Đã xóa khóa học.',
  publish: 'Đã xuất bản khóa học.',
  unpublish: 'Đã hủy xuất bản khóa học.',
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
      setAction({ busy: false, error: failure.message || 'Không thể thực hiện thao tác này.' })
    }
  }

  const text = dialog ? DIALOG_TEXT[dialog.type] : null

  return (
    <>
      <div className="page-heading tc-head">
        <div>
          <span className="eyebrow">GIÁO VIÊN</span>
          <h1>Khóa học của tôi</h1>
          <p>Quản lý khóa học, module và bài học của bạn.</p>
        </div>
        <Link className="button" to="/teacher/courses/new">
          + Tạo khóa học
        </Link>
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error.message}</Notice>}

      <form className="filters" onSubmit={applyFilters} onReset={resetFilters}>
        <label>
          Tìm kiếm khóa học
          <input
            placeholder="Tìm theo tên khóa học..."
            maxLength={150}
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
          />
        </label>
        <label>
          Trạng thái
          <select value={statusInput} onChange={(event) => setStatusInput(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
        </label>
        <label>
          Sắp xếp theo
          <select value={sortInput} onChange={(event) => setSortInput(event.target.value)}>
            {SORT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Tìm kiếm</button>
          <button type="reset" className="button-secondary">
            Đặt lại
          </button>
        </div>
      </form>

      {result && (
        <ResultCount
          page={result.page}
          size={result.size}
          totalElements={result.totalElements}
          noun="khóa học"
        />
      )}

      <div className="table-wrap" aria-busy={loading}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Khóa học</th>
              <th>Module</th>
              <th>Bài học</th>
              <th>Học viên</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((course, index) => (
              <tr key={course.courseId}>
                <td>{page * PAGE_SIZE + index + 1}</td>
                <td>
                  <div className="tc-course-cell">
                    {course.thumbnailUrl ? (
                      <img className="tc-thumb" src={courseImageUrl(course.thumbnailUrl)} alt="" />
                    ) : (
                      <span className="tc-thumb">Chưa có ảnh</span>
                    )}
                    <div>
                      <span>{course.title}</span>
                      <small>Ngày tạo: {formatDate(course.createdAt)}</small>
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
                    <Link className="button button-secondary" to={`/teacher/courses/${course.courseId}/content`}>
                      Nội dung
                    </Link>
                    <Link className="button button-secondary" to={`/teacher/courses/${course.courseId}/edit`}>
                      Sửa
                    </Link>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        openDialog(course.status === 'PUBLISHED' ? 'unpublish' : 'publish', course)
                      }
                    >
                      {course.status === 'PUBLISHED' ? 'Hủy xuất bản' : 'Xuất bản'}
                    </button>
                    <button
                      type="button"
                      className="button button-secondary tc-danger"
                      onClick={() => openDialog('delete', course)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && !result && <p className="tc-empty">Đang tải danh sách khóa học…</p>}
        {result && result.items.length === 0 && (
          <p className="tc-empty">
            {filters.keyword || filters.status
              ? 'Không có khóa học nào phù hợp với tìm kiếm.'
              : 'Bạn chưa tạo khóa học nào.'}
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
