import { Link, useNavigate } from 'react-router'
import { Fragment, useEffect, useState } from 'react'
import { getRegistrations } from '../../enrollment/services/registrationService.js'
import { getCourse } from '../services/courseService.js'

const PAGE_SIZE = 5

// Courses the student can learn: registrations whose enrollment is active.
export default function MyCoursesPage() {
  const [query, setQuery] = useState({
    page: 0,
    size: PAGE_SIZE,
    sort: 'registeredAt,desc',
    status: 'ACTIVE',
  })
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  // Open the first lesson of module 1; without lessons, open the course detail page.
  async function explore(courseId) {
    try {
      const { data } = await getCourse(courseId)
      const firstLesson = data.modules[0]?.lessons[0]
      navigate(firstLesson ? `/courses/${courseId}/lessons/${firstLesson.lessonId}` : `/courses/${courseId}`)
    } catch (e) {
      setError(e.message)
    }
  }
  useEffect(() => {
    const controller = new AbortController()
    getRegistrations(query, controller.signal)
      .then(({ data }) => {
        setResult(data)
        setError('')
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message)
        }
      })
    return () => controller.abort()
  }, [query])
  function search(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setQuery({
      page: 0,
      size: PAGE_SIZE,
      sort: values.sort,
      status: 'ACTIVE',
      keyword: values.keyword || undefined,
    })
  }
  function resetFilters(event) {
    event.preventDefault()
    const fields = event.currentTarget.elements
    fields.namedItem('keyword').value = ''
    fields.namedItem('sort').value = 'registeredAt,desc'
    setError('')
    setQuery({ page: 0, size: PAGE_SIZE, sort: 'registeredAt,desc', status: 'ACTIVE' })
  }
  return (
    <>
      <div
        className="breadcrumb registration-breadcrumb"
        aria-label="Đường dẫn trang"
      >
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Khóa học của tôi</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">KHÔNG GIAN HỌC TẬP</span>
        <h1>Khóa học của tôi</h1>
        <p>Các khóa học bạn đã đăng ký thành công. Chọn một khóa để tiếp tục học.</p>
      </div>
      <form className="filters" onSubmit={search} onReset={resetFilters}>
        <label>
          Tìm kiếm
          <input name="keyword" placeholder="Tên khóa học" />
        </label>
        <label>
          Ngày đăng ký
          <select name="sort" defaultValue="registeredAt,desc">
            <option value="registeredAt,desc">Mới nhất</option>
            <option value="registeredAt,asc">Cũ nhất</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Tìm kiếm</button>
          <button type="reset" className="button-secondary">Đặt lại</button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      {result ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Khóa học</th>
                  <th>Giảng viên</th>
                  <th>Ngày đăng ký</th>
                  <th>Học phí</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((r, index) => (
                  <tr key={r.registrationId}>
                    <td>{query.page * PAGE_SIZE + index + 1}</td>
                    <td>
                      <Link to={`/courses/${r.courseId}`}>{r.courseTitle}</Link>
                    </td>
                    <td>{r.teacherName}</td>
                    <td>{r.registeredAt?.replace('T', ' ')}</td>
                    <td>{Number(r.amount).toLocaleString('vi-VN')} ₫</td>
                    <td>
                      <button onClick={() => explore(r.courseId)}>
                        Khám phá ngay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result.items.length && (
            <p>
              Bạn chưa có khóa học nào. <Link to="/courses">Khám phá khóa học</Link>
            </p>
          )}
          {result.totalPages > 0 && (
            <div className="pagination">
              <button
                disabled={query.page === 0}
                onClick={() => setQuery({ ...query, page: query.page - 1 })}
              >
                Trước
              </button>
              {/* First, last and 2 pages around the current one; "…" marks skipped pages. */}
              {Array.from({ length: result.totalPages }, (_, page) => page)
                .filter((page) => page === 0 || page === result.totalPages - 1 || Math.abs(page - query.page) <= 2)
                .map((page, index, shown) => (
                  <Fragment key={page}>
                    {index > 0 && page - shown[index - 1] > 1 && <span className="page-ellipsis">…</span>}
                    <button
                      className="page-number"
                      aria-label={`Trang ${page + 1}`}
                      aria-current={query.page === page ? 'page' : undefined}
                      onClick={() => setQuery({ ...query, page })}
                    >
                      {page + 1}
                    </button>
                  </Fragment>
                ))}
              <button
                disabled={query.page + 1 >= result.totalPages}
                onClick={() => setQuery({ ...query, page: query.page + 1 })}
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        !error && <p>Đang tải...</p>
      )}
    </>
  )
}
