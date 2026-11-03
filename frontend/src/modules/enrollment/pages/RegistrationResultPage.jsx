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
      <h1>Kết quả đăng ký</h1>
      {error && <p role="alert">{error}</p>}
      {registration && (
        <section className="card">
          <h2>
            {registration.status === 'ACTIVE'
              ? 'Đăng ký thành công'
              : registration.activeRegistrationId
                ? 'Khóa học đã được kích hoạt từ đăng ký khác'
                : registration.status === 'EXPIRED'
                  ? 'Đăng ký đã hết hạn'
                  : 'Đang chờ thanh toán'}
          </h2>
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
          <a href="#/registrations">Về danh sách đăng ký</a>
        </section>
      )}
    </>
  )
}
