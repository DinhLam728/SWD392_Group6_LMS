import { useCallback, useEffect, useRef, useState } from 'react'
import { getRegistration } from '../../enrollment/services/registrationService.js'
import RegistrationInfo from '../../enrollment/components/RegistrationInfo.jsx'

export default function PaymentQrPage({ id }) {
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  const controllerRef = useRef(null)
  const check = useCallback(async () => {
    const signal = controllerRef.current?.signal
    if (!signal || signal.aborted) {
      return
    }
    if (inFlight.current) {
      return
    }
    inFlight.current = true
    setBusy(true)
    try {
      const { data } = await getRegistration(id, signal)
      if (signal.aborted) {
        return
      }
      setRegistration(data)
      setError('')
      if (data.status !== 'PENDING') {
        window.location.hash = `/registrations/${id}`
      }
    } catch (e) {
      if (!signal.aborted) {
        setError(e.message)
      }
    } finally {
      inFlight.current = false
      if (!signal.aborted) {
        setBusy(false)
      }
    }
  }, [id])
  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    const initial = setTimeout(() => check(), 0)
    const timer = setInterval(() => {
      if (!document.hidden) {
        check()
      }
    }, 5000)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
      controller.abort()
    }
  }, [check])
  return (
    <>
      <h1>Thanh toán khóa học</h1>
      <p>
        Quét QR bằng ứng dụng ngân hàng. Bạn có thể lưu QR và thanh toán trong
        hạn 24 giờ.
      </p>
      {error && <p role="alert">{error}</p>}
      {registration && (
        <div className="two-columns">
          <section className="card qr-card">
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
                  Nội dung: <strong>{registration.payment.paymentCode}</strong>
                </p>
              </>
            )}
            <button disabled={busy} onClick={() => check()}>
              {busy ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái thanh toán'}
            </button>
            <p>Đăng ký được kích hoạt sau khi hệ thống xác minh thanh toán.</p>
          </section>
          <section className="card">
            <h2>Thông tin đăng ký</h2>
            <RegistrationInfo registration={registration} />
          </section>
        </div>
      )}
    </>
  )
}
