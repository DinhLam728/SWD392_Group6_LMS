export default function Notice({ tone = 'success', children }) {
  return (
    <div className={`tc-notice tc-notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
