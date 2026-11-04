import CourseCreatedAt from '../components/CourseCreatedAt.jsx'
import { useEffect, useState } from 'react'
import { getCourses } from '../services/courseService.js'

export default function AvailableCoursesPage() {
  const [query, setQuery] = useState({ page: 0, size: 8, sort: 'price,asc' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getCourses(query, controller.signal)
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
    setResult(null)
    setQuery({
      ...values,
      minPrice: values.minPrice || undefined,
      maxPrice: values.maxPrice || undefined,
      page: 0,
      size: 8,
    })
  }
  function resetFilters() {
    setError('')
    setResult(null)
    setQuery({ page: 0, size: 8, sort: 'price,asc' })
  }
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">KHÔNG GIAN HỌC TẬP</span>
        <h1>Khám phá khóa học</h1>
        <p>Chọn khóa học phù hợp và bắt đầu hành trình học tập.</p>
      </div>
      <form className="filters course-filters" onSubmit={search} onReset={resetFilters}>
        <label>
          Tìm khóa học
          <input name="keyword" placeholder="Nhập từ khóa để tìm kiếm" />
        </label>
        <label>
          Giá từ
          <input name="minPrice" type="number" min="0" placeholder="VD: 5.000" />
        </label>
        <label>
          Đến
          <input name="maxPrice" type="number" min="0" placeholder="VD: 50.000" />
        </label>
        <label>
          Sắp xếp
          <select name="sort">
            <option value="price,asc">Giá tăng dần</option>
            <option value="price,desc">Giá giảm dần</option>
            <option value="createdAt,desc">Mới nhất</option>
            <option value="createdAt,asc">Cũ nhất</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Tìm kiếm</button>
          <button type="reset" className="button-secondary">Đặt lại</button>
        </div>
      </form>
      {error ? (
        <p role="alert">{error}</p>
      ) : !result ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <p className="course-count" role="status">
            Hiển thị{' '}
            <strong>
              {result.items.length ? result.page * result.size + 1 : 0}–
              {result.items.length
                ? result.page * result.size + result.items.length
                : 0}
            </strong>{' '}
            trên tổng <strong>{result.totalElements}</strong> khóa học
          </p>
          <div className="course-grid">
            {result.items.map((course) => (
              <article className="card course-card" key={course.courseId}>
                {course.thumbnailUrl ? (
                  <img className="thumbnail" src={course.thumbnailUrl} alt="" />
                ) : (
                  <div className="placeholder">
                    <span className="cover-symbol">&lt;/&gt;</span>
                    <span>LMS ACADEMY</span>
                  </div>
                )}
                <h2>{course.title}</h2>
                <p className="teacher-name">
                  Giảng viên · {course.teacherName}
                </p>
                <CourseCreatedAt value={course.createdAt} />
                <p className="course-description">{course.description}</p>
                <div className="course-card-footer">
                  <strong>
                    {Number(course.price).toLocaleString('vi-VN')} ₫
                  </strong>
                  <a className="button" href={`#/courses/${course.courseId}`}>
                    Xem chi tiết →
                  </a>
                </div>
              </article>
            ))}
          </div>
          {result.items.length === 0 && <p>Không tìm thấy khóa học.</p>}
          <div className="pagination">
            <button
              disabled={query.page === 0}
              onClick={() => setQuery({ ...query, page: query.page - 1 })}
            >
              Trước
            </button>
            {Array.from({ length: result.totalPages }, (_, page) => (
              <button
                key={page}
                className="page-number"
                aria-label={`Trang ${page + 1}`}
                aria-current={query.page === page ? 'page' : undefined}
                onClick={() => setQuery({ ...query, page })}
              >
                {page + 1}
              </button>
            ))}
            <button
              disabled={query.page + 1 >= result.totalPages}
              onClick={() => setQuery({ ...query, page: query.page + 1 })}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </>
  )
}
