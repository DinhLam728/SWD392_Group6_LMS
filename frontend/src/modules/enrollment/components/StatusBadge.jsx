const labels = {
  ACTIVE: 'Đã kích hoạt',
  PENDING: 'Đang chờ',
  EXPIRED: 'Đã hết hạn',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status?.toLowerCase()}`}>
      {labels[status] || status}
    </span>
  )
}
