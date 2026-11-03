import { formatRegistrationId } from '../utils/formatRegistrationId.js'
import StatusBadge from './StatusBadge.jsx'

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})
const dateTime = (value) => value?.replace('T', ' ') || '—'

export default function RegistrationInfo({ registration }) {
  const fields = [
    ['Mã đăng ký', formatRegistrationId(registration.registrationId)],
    ['Khóa học', registration.courseTitle],
    ['Số tiền', money.format(registration.amount)],
    ['Đăng ký', <StatusBadge status={registration.status} />],
    ['Thanh toán', <StatusBadge status={registration.paymentStatus} />],
    ['Ngày đăng ký', dateTime(registration.registeredAt)],
    ['Hạn thanh toán', `${dateTime(registration.expiresAt)} (giờ Việt Nam)`],
  ]
  if (registration.transactionRef)
    fields.push(['Mã giao dịch', registration.transactionRef])
  if (registration.paidAt)
    fields.push(['Ngày thanh toán', dateTime(registration.paidAt)])

  return (
    <dl className="details">
      {fields.map(([label, value]) => (
        <div className="detail-field" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
