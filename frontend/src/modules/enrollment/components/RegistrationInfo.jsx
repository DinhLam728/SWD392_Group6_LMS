const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

export default function RegistrationInfo({ registration }) {
  return (
    <dl className="details">
      <dt>Mã đăng ký</dt>
      <dd>#{registration.registrationId}</dd>
      <dt>Khóa học</dt>
      <dd>{registration.courseTitle}</dd>
      <dt>Số tiền</dt>
      <dd>{money.format(registration.amount)}</dd>
      <dt>Đăng ký</dt>
      <dd>{registration.status}</dd>
      <dt>Thanh toán</dt>
      <dd>{registration.paymentStatus}</dd>
      <dt>Ngày đăng ký</dt>
      <dd>{registration.registeredAt?.replace('T', ' ')}</dd>
      <dt>Hạn thanh toán</dt>
      <dd>{registration.expiresAt?.replace('T', ' ')} (giờ Việt Nam)</dd>
      {registration.transactionRef && (
        <>
          <dt>Mã giao dịch</dt>
          <dd>{registration.transactionRef}</dd>
        </>
      )}
      {registration.paidAt && (
        <>
          <dt>Ngày thanh toán</dt>
          <dd>{registration.paidAt.replace('T', ' ')}</dd>
        </>
      )}
    </dl>
  )
}
