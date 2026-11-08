import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getRegistration, simulatePayment } from '../../enrollment/services/registrationService.js'
import RegistrationInfo from '../../enrollment/components/RegistrationInfo.jsx'

export default function PaymentQrPage() {
  const { id } = useParams()
  if (!/^\d+$/.test(id)) return <p>Không tìm thấy trang.</p>
  return <PaymentQrPageContent key={id} id={id} />
}

function PaymentQrPageContent({ id }) {
  const navigate = useNavigate()
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [manualFeedback, setManualFeedback] = useState('')

  const loadStatus = useCallback(
    async (signal) => {
      const { data } = await getRegistration(id, signal)
      if (data.status !== 'PENDING') {
        navigate(`/registrations/${id}`)
      } else {
        setRegistration(data)
        setError('')
      }
      return data
    },
    [id, navigate],
  )

  useEffect(() => {
    const controller = new AbortController()
    const refresh = () => {
      if (document.hidden) return
      loadStatus(controller.signal).catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
    }
    const first = setTimeout(refresh, 0)
    const timer = setInterval(refresh, 5000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
      controller.abort()
    }
  }, [loadStatus])

  async function payDemo() {
    setBusy(true)
    setManualFeedback('')
    try {
      await simulatePayment(id)
      await loadStatus()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function checkNow() {
    setBusy(true)
    setManualFeedback('')
    try {
      const data = await loadStatus()
      if (data.status === 'PENDING') {
        const time = new Date().toLocaleTimeString('vi-VN')
        setManualFeedback(`Chưa ghi nhận thanh toán · Đã kiểm tra lúc ${time}.`)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="breadcrumb registration-breadcrumb" aria-label="Đường dẫn trang">
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        {registration ? (
          <Link to={`/courses/${registration.courseId}`}>Chi tiết khóa học</Link>
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
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #cbd5e1' }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  Chạy trên máy local nên SePay không gọi được webhook URL để báo giao dịch về hệ thống.
                  Bấm nút dưới đây để giả lập SePay đã nhận tiền.
                </p>
                <button className="full-width" disabled={busy} onClick={payDemo}>
                  Giả lập đã chuyển khoản (demo)
                </button>
              </div>
            </section>
            <section className="card">
              <h2>Thông tin đăng ký</h2>
              <RegistrationInfo registration={registration} />
              <button
                className="full-width"
                disabled={busy}
                aria-busy={busy}
                onClick={checkNow}
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
