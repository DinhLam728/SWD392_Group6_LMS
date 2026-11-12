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
          <button type="button" className="button button-secondary" onClick={onCancel} disabled={busy}>
            Hủy
          </button>
          <button
            type="button"
            className={danger ? 'button tc-danger-solid' : 'button'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Đang xử lý…' : confirmLabel}
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
