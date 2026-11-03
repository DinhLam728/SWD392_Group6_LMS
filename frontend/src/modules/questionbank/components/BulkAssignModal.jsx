import { useState } from 'react'

export function BulkAssignModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}) {
  const [quizId, setQuizId] = useState('1')
  const [quizTitle, setQuizTitle] = useState('')
  const [actionType, setActionType] = useState('assign')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleApply = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (actionType === 'unassign') {
        await onConfirm(null, null)
      } else {
        await onConfirm(Number(quizId), quizTitle.trim() || `Quiz #${quizId}`)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lms-modal-overlay">
      <div className="lms-modal-dialog" style={{ maxWidth: '480px' }}>
        <div className="lms-modal-header">
          <div className="lms-modal-title-group">
            <h2 className="lms-modal-title">Bulk Assign Questions</h2>
            <p className="lms-modal-subtitle">
              Move or assign {selectedCount} selected questions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lms-modal-close"
            title="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="lms-modal-body">
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#1e40af',
                fontWeight: 500,
              }}
            >
              You have selected <strong>{selectedCount}</strong> question{selectedCount > 1 ? 's' : ''} to update.
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label">Destination</label>
              <div style={{ display: 'flex', gap: '18px', marginTop: '4px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="bulkActionType"
                    checked={actionType === 'assign'}
                    onChange={() => setActionType('assign')}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Assign to a Quiz
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="bulkActionType"
                    checked={actionType === 'unassign'}
                    onChange={() => setActionType('unassign')}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Move to Reserve Bank
                </label>
              </div>
            </div>

            {actionType === 'assign' && (
              <>
                <div className="lms-form-group">
                  <label className="lms-form-label">
                    Quiz ID <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="lms-form-control"
                    style={{ width: '100%' }}
                    value={quizId}
                    onChange={(e) => setQuizId(e.target.value)}
                    placeholder="e.g. 1"
                  />
                </div>

                <div className="lms-form-group">
                  <label className="lms-form-label">
                    Quiz Title
                    <span className="lms-form-label-hint">Optional</span>
                  </label>
                  <input
                    type="text"
                    className="lms-form-control"
                    style={{ width: '100%' }}
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Week 5 OOP Progress Test"
                  />
                </div>
              </>
            )}
          </div>

          <div className="lms-modal-footer">
            <button type="button" className="btn-lms btn-lms-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-lms btn-lms-primary">
              {loading ? 'Updating...' : 'Apply Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
