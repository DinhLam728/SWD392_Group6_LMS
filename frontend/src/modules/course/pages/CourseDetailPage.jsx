import { useEffect, useState } from 'react'
import { getCourse } from '../services/courseService.js'
import { registerCourse } from '../../enrollment/services/registrationService.js'

export default function CourseDetailPage({ id }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    getCourse(id, controller.signal)
      .then(({ data }) => setDetail(data))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message)
        }
      })
    return () => controller.abort()
  }, [id])
  async function register() {
    setBusy(true)
    setError('')
    try {
      const { data } = await registerCourse(Number(id))
      window.location.hash = `/registrations/${data.registrationId}/payment`
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <a href="#/courses">← Các khóa học</a>
      {error && <p role="alert">{error}</p>}
      {!detail ? (
        <p>Đang tải khóa học...</p>
      ) : (
        <>
          <h1>{detail.course.title}</h1>
          <p>Giảng viên: {detail.course.teacherName}</p>
          <div className="two-columns">
            <section className="card">
              <h2>Giới thiệu</h2>
              <p>{detail.course.description}</p>
              <h2>Nội dung khóa học</h2>
              <ol>
                {detail.modules.map((module) => (
                  <li key={module.moduleId}>{module.title}</li>
                ))}
              </ol>
            </section>
            <aside className="card">
              <h2>Đăng ký khóa học</h2>
              <p className="price">
                {Number(detail.course.price).toLocaleString('vi-VN')} ₫
              </p>
              {detail.registrationId ? (
                <a
                  className="button"
                  href={`#/registrations/${detail.registrationId}${detail.registrationStatus === 'PENDING' ? '/payment' : ''}`}
                >
                  {detail.registrationStatus === 'ACTIVE'
                    ? 'Đã đăng ký · Xem kết quả'
                    : 'Tiếp tục thanh toán'}
                </a>
              ) : (
                <button disabled={busy} onClick={register}>
                  {busy ? 'Đang tạo đăng ký...' : 'Đăng ký khóa học'}
                </button>
              )}
              <p>Thanh toán bằng QR SePay. Thời hạn 24 giờ.</p>
            </aside>
          </div>
        </>
      )}
    </>
  )
}
