import { useEffect, useState } from 'react'
import { getRegistration } from '../services/registrationService.js'
import RegistrationInfo from '../components/RegistrationInfo.jsx'

export default function RegistrationResultPage({ id }) {
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
        <a href="#/courses">Khóa học</a>
        <span aria-hidden="true"> / </span>
        <a href="#/registrations">Đăng ký của tôi</a>
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
          <div
            className={`notice ${registration.status === 'ACTIVE' ? 'notice-success' : registration.status === 'PENDING' ? 'notice-pending' : 'notice-neutral'}`}
          >
            <span className="notice-icon">
              {registration.status === 'ACTIVE' ? '✓' : '◷'}
            </span>
            <div>
              <h2>
                {registration.status === 'ACTIVE'
                  ? 'Đăng ký thành công'
                  : registration.activeRegistrationId
                    ? 'Khóa học đã được kích hoạt từ đăng ký khác'
                    : registration.status === 'EXPIRED'
                      ? 'Đăng ký đã hết hạn'
                      : 'Đang chờ thanh toán'}
              </h2>
              <p>
                {registration.status === 'ACTIVE'
                  ? 'Thanh toán đã được xác nhận. Đăng ký khóa học của bạn đã được kích hoạt.'
                  : 'Theo dõi thông tin và trạng thái đăng ký của bạn bên dưới.'}
              </p>
            </div>
          </div>
          {registration.status !== 'ACTIVE' &&
            registration.activeRegistrationId && (
              <>
                <p>Không cần thanh toán thêm cho đăng ký này.</p>
                {registration.paymentStatus === 'SUCCESS' && (
                  <p>
                    Khoản thanh toán này đã được ghi nhận. Quyền học của bạn
                    được giữ ở đăng ký bên dưới.
                  </p>
                )}
                <a
                  className="button"
                  href={`#/registrations/${registration.activeRegistrationId}`}
                >
                  Xem đăng ký đang hoạt động
                </a>
              </>
            )}
          <h2>Thông tin đăng ký</h2>
          <RegistrationInfo registration={registration} />
          {registration.status === 'PENDING' && (
            <a className="button" href={`#/registrations/${id}/payment`}>
              Tiếp tục thanh toán
            </a>
          )}
          {registration.status === 'EXPIRED' &&
            !registration.activeRegistrationId && (
              <a className="button" href={`#/courses/${registration.courseId}`}>
                Đăng ký lại
              </a>
            )}
          <div className="result-actions">
            <a className="button button-secondary" href="#/courses">
              ← Về khóa học
            </a>
            <a className="button" href="#/registrations">
              Đăng ký của tôi →
            </a>
          </div>
        </section>
      )}
    </>
  )
}
