import Dialog from './Dialog.jsx'
import Notice from './Notice.jsx'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger = false,
  busy = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog
      title={title}
      onClose={busy ? () => {} : onCancel}
      footer={
        <>
          <button type="button" className="tc-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? 'tc-btn tc-btn-danger-solid' : 'tc-btn tc-btn-primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
      {error && (
        <div style={{ marginTop: '0.8rem' }}>
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </Dialog>
  )
}
