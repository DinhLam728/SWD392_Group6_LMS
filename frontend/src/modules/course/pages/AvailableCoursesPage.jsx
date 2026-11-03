import { useEffect, useState } from 'react'
import { getCourses } from '../services/courseService.js'

export default function AvailableCoursesPage() {
  const [query, setQuery] = useState({ page: 0, size: 9, sort: 'price,asc' })
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
      size: 9,
    })
  }
  return (
    <>
      <h1>Khám phá khóa học</h1>
      <p>Chọn khóa học phù hợp và bắt đầu hành trình học tập.</p>
      <form className="filters" onSubmit={search}>
        <label>
          Tìm khóa học
          <input name="keyword" placeholder="Tên khóa học" />
        </label>
        <label>
          Giá từ
          <input name="minPrice" type="number" min="0" />
        </label>
        <label>
          Đến
          <input name="maxPrice" type="number" min="0" />
        </label>
        <label>
          Sắp xếp
          <select name="sort">
            <option value="price,asc">Giá tăng dần</option>
            <option value="price,desc">Giá giảm dần</option>
          </select>
        </label>
        <button>Tìm kiếm</button>
      </form>
      {error ? (
        <p role="alert">{error}</p>
      ) : !result ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <div className="course-grid">
            {result.items.map((course) => (
              <article className="card" key={course.courseId}>
                {course.thumbnailUrl ? (
                  <img className="thumbnail" src={course.thumbnailUrl} alt="" />
                ) : (
                  <div className="placeholder">LMS · LEARN</div>
                )}
                <h2>{course.title}</h2>
                <p>{course.teacherName}</p>
                <p>{course.description}</p>
                <strong>
                  {Number(course.price).toLocaleString('vi-VN')} ₫
                </strong>
                <a className="button" href={`#/courses/${course.courseId}`}>
                  Xem chi tiết
                </a>
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
            <span>
              Trang {query.page + 1} / {Math.max(1, result.totalPages)}
            </span>
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
