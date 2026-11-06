export default function StatusBadge({ status }) {
  return <span className={`tc-badge tc-badge-${status.toLowerCase()}`}>{status}</span>
}
