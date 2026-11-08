export default function StatusBadge({ status }) {
  const published = status === 'PUBLISHED'
  return (
    <span className={`status-badge ${published ? 'status-active' : 'status-pending'}`}>
      {published ? 'PUBLISHED' : 'DRAFT'}
    </span>
  )
}
