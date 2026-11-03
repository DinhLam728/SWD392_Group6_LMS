import { useCallback, useEffect, useRef, useState } from 'react'
import { getRegistration } from '../../enrollment/services/registrationService.js'
import RegistrationInfo from '../../enrollment/components/RegistrationInfo.jsx'

export default function PaymentQrPage({ id }) {
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [manualFeedback, setManualFeedback] = useState('')
  const inFlight = useRef(null)
  const controllerRef = useRef(null)
  const check = useCallback(
    async (manual = false) => {
      const signal = controllerRef.current?.signal
      if (!signal || signal.aborted) {
        return
      }
      // Manual checks share any pending background request instead of sending another.
      const request = inFlight.current || getRegistration(id, signal)
      inFlight.current = request
      if (manual) {
        setBusy(true)
        setManualFeedback('')
      }
      try {
        const { data } = await request
        if (signal.aborted) {
          return
        }
        setRegistration((previous) =>
          JSON.stringify(previous) === JSON.stringify(data) ? previous : data,
        )
        setError('')
        if (manual && data.status === 'PENDING') {
          const time = new Date().toLocaleTimeString('vi-VN')
          setManualFeedback(
            `Chưa ghi nhận thanh toán · Đã kiểm tra lúc ${time}.`,
          )
        }
        if (data.status !== 'PENDING') {
          window.location.hash = `/registrations/${id}`
        }
      } catch (e) {
        if (!signal.aborted) {
          setError(e.message)
        }
      } finally {
        if (inFlight.current === request) inFlight.current = null
        if (manual && !signal.aborted) setBusy(false)
      }
    },
    [id],
  )
  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    const initial = setTimeout(() => check(), 0)
    const timer = setInterval(() => {
      if (!document.hidden) {
        check()
      }
    }, 5000)
    const checkOnReturn = () => {
      if (!document.hidden) check()
    }
    document.addEventListener('visibilitychange', checkOnReturn)
    return () => {
      document.removeEventListener('visibilitychange', checkOnReturn)
      clearTimeout(initial)
      clearInterval(timer)
      controller.abort()
    }
  }, [check])
  return (
    <>
      <div className="breadcrumb registration-breadcrumb" aria-label="Đường dẫn trang">
        <a href="#/courses">Khóa học</a>
        <span aria-hidden="true"> / </span>
        {registration ? (
          <a href={`#/courses/${registration.courseId}`}>Chi tiết khóa học</a>
        ) : (
          <span>Chi tiết khóa học</span>
        )}
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Thanh toán</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">THANH TOÁN AN TOÀN QUA SEPAY</span>
        <h1>Thanh toán khóa học</h1>
        <p>
          Quét QR bằng ứng dụng ngân hàng. Bạn có thể lưu QR và thanh toán trong
          hạn 24 giờ.
        </p>
      </div>
      {error && <p role="alert">{error}</p>}
      {registration && (
        <>
          <div className="notice notice-pending">
            <span className="notice-icon">◷</span>
            <div>
              <h2>Đăng ký đã tạo · Đang chờ thanh toán</h2>
              <p>
                Thanh toán đúng số tiền và giữ nguyên nội dung để tự động kích
                hoạt khóa học.
              </p>
            </div>
          </div>
          <div className="two-columns payment-layout">
            <section className="card qr-card">
              <h2>Quét mã QR thanh toán</h2>
              {registration.payment && (
                <>
                  <img
                    className="qr"
                    src={registration.payment.qrUrl}
                    alt="Mã QR thanh toán SePay"
                  />
                  <p>
                    {registration.payment.bank} ·{' '}
                    {registration.payment.accountNumber}
                  </p>
                  <p>{registration.payment.accountName}</p>
                  <p>
                    Nội dung:{' '}
                    <strong>{registration.payment.paymentCode}</strong>
                  </p>
                </>
              )}
              <p className="muted">
                Mở ứng dụng ngân hàng để quét mã và xác nhận chuyển khoản.
              </p>
            </section>
            <section className="card">
              <h2>Thông tin đăng ký</h2>
              <RegistrationInfo registration={registration} />
              <button
                className="full-width"
                disabled={busy}
                aria-busy={busy}
                onClick={() => check(true)}
              >
                {busy ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái thanh toán'}
              </button>
              <p className="muted payment-check-feedback" role="status">
                {busy
                  ? 'Đang kiểm tra trạng thái thanh toán…'
                  : manualFeedback ||
                    'Trạng thái được tự động cập nhật mỗi 5 giây khi bạn mở trang này.'}
              </p>
            </section>
          </div>
        </>
      )}
    </>
  )
}
