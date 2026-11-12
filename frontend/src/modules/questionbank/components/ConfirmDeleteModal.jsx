export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xóa câu hỏi',
  message,
  error,
  isBlocked = false,
  busy = false,
}) {
  if (!isOpen) return null

  return (
    <div className="lms-modal-overlay">
      <div className="lms-modal-dialog" style={{ maxWidth: '460px', padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {message}
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13.5px',
              color: '#b91c1c',
              lineHeight: 1.5,
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn-lms btn-lms-secondary"
            onClick={onClose}
            disabled={busy}
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13.5px' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || isBlocked}
            style={{
              backgroundColor: isBlocked ? '#fca5a5' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: isBlocked || busy ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {busy ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

