import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getRegistration } from '../services/registrationService.js'
import RegistrationInfo from '../components/RegistrationInfo.jsx'

export default function RegistrationResultPage() {
  const { id } = useParams()
  if (!/^\d+$/.test(id)) return <p>Không tìm thấy trang.</p>
  return <RegistrationResultPageContent key={id} id={id} />
}

function resultTitle(registration) {
  if (registration.status === 'ACTIVE') return 'Đăng ký thành công'
  if (registration.enrolledRegistrationId) return 'Khóa học đã được kích hoạt từ đăng ký khác'
  if (registration.status === 'EXPIRED') return 'Đăng ký đã hết hạn'
  return 'Đang chờ thanh toán'
}

function noticeClass(status) {
  if (status === 'ACTIVE') return 'notice-success'
  if (status === 'PENDING') return 'notice-pending'
  return 'notice-neutral'
}

function RegistrationResultPageContent({ id }) {
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getRegistration(id, controller.signal)
      .then(({ data }) => setRegistration(data))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message)
        }
      })
    return () => controller.abort()
  }, [id])
  return (
    <>
      <div className="breadcrumb registration-breadcrumb" aria-label="Đường dẫn trang">
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <Link to="/registrations">Đăng ký của tôi</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Kết quả đăng ký</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">THÔNG TIN ĐĂNG KÝ</span>
        <h1>Kết quả đăng ký</h1>
      </div>
      {error && <p role="alert">{error}</p>}
      {registration && (
        <section className="card result-card">
          <div className={`notice ${noticeClass(registration.status)}`}>
            <span className="notice-icon">
              {registration.status === 'ACTIVE' ? '✓' : '◷'}
            </span>
            <div>
              <h2>{resultTitle(registration)}</h2>
              <p>
                {registration.status === 'ACTIVE'
                  ? 'Thanh toán đã được xác nhận. Đăng ký khóa học của bạn đã được kích hoạt.'
                  : 'Theo dõi thông tin và trạng thái đăng ký của bạn bên dưới.'}
              </p>
            </div>
          </div>
          {registration.status !== 'ACTIVE' &&
            registration.enrolledRegistrationId && (
              <>
                <p>Không cần thanh toán thêm cho đăng ký này.</p>
                {registration.paymentStatus === 'SUCCESS' && (
                  <p>
                    Khoản thanh toán này đã được ghi nhận. Quyền học của bạn
                    được giữ ở đăng ký bên dưới.
                  </p>
                )}
                <Link
                  className="button"
                  to={`/registrations/${registration.enrolledRegistrationId}`}
                >
                  Xem đăng ký đang hoạt động
                </Link>
              </>
            )}
          <h2>Thông tin đăng ký</h2>
          <RegistrationInfo registration={registration} />
          {registration.status === 'PENDING' && (
            <Link className="button" to={`/registrations/${id}/payment`}>
              Tiếp tục thanh toán
            </Link>
          )}
          {registration.status === 'EXPIRED' &&
            !registration.enrolledRegistrationId && (
              <Link className="button" to={`/courses/${registration.courseId}`}>
                Đăng ký lại
              </Link>
            )}
          <div className="result-actions">
            <Link className="button button-secondary" to="/courses">
              ← Về khóa học
            </Link>
            <Link className="button" to="/registrations">
              Đăng ký của tôi →
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
