const TONE_CLASS = {
  success: 'notice-success',
  error: 'tc-notice-error',
  ai: 'tc-notice-ai',
  neutral: 'notice-neutral',
}

// Built on the shared .notice box; tone picks the colour.
export default function Notice({ tone = 'success', children }) {
  return (
    <div className={`notice tc-notice ${TONE_CLASS[tone] ?? TONE_CLASS.neutral}`} role={tone === 'error' ? 'alert' : 'status'}>
      <div>{children}</div>
    </div>
  )
}
