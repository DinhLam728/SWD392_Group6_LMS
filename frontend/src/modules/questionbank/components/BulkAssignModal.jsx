import { useEffect, useState } from 'react'
import { getCourseModules } from '../services/questionBankService.js'

export function BulkAssignModal({
  isOpen,
  onClose,
  courseId,
  selectedCount,
  onConfirm,
}) {
  const [modules, setModules] = useState([])
  const [moduleId, setModuleId] = useState('')
  const [actionType, setActionType] = useState('assign')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !courseId) return
    getCourseModules(courseId)
      .then((items) => {
        setModules(items)
        setModuleId(items[0] ? String(items[0].moduleId) : '')
      })
      .catch(() => setModules([]))
  }, [isOpen, courseId])

  if (!isOpen) return null

  const handleApply = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (actionType === 'unassign') {
        await onConfirm(null, null)
      } else {
        const module = modules.find((m) => String(m.moduleId) === moduleId)
        await onConfirm(Number(moduleId), module?.title)
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
            <h2 className="lms-modal-title">Gán câu hỏi hàng loạt</h2>
            <p className="lms-modal-subtitle">
              Di chuyển hoặc gán {selectedCount} câu hỏi đã chọn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lms-modal-close"
            title="Đóng"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'none',
              minWidth: 'auto',
              minHeight: 'auto',
              lineHeight: 1,
            }}
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
              Bạn đã chọn <strong>{selectedCount}</strong> câu hỏi để cập nhật.
            </div>

            <div className="lms-form-group">
              <label className="lms-form-label">Điểm đến / Mục tiêu</label>
              <div style={{ display: 'flex', gap: '18px', marginTop: '4px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="bulkActionType"
                    checked={actionType === 'assign'}
                    onChange={() => setActionType('assign')}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Gán vào một Module
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="bulkActionType"
                    checked={actionType === 'unassign'}
                    onChange={() => setActionType('unassign')}
                    style={{ accentColor: '#2563eb' }}
                  />
                  Chuyển về Ngân hàng tự do (Chưa gán)
                </label>
              </div>
            </div>

            {actionType === 'assign' && (
              <div className="lms-form-group">
                <label className="lms-form-label">
                  Chọn Module <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {modules.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#b91c1c' }}>
                    Khóa học này chưa có module nào. Vui lòng tạo module trước trong khóa học.
                  </p>
                ) : (
                  <select
                    required
                    className="lms-form-select"
                    style={{ width: '100%' }}
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                  >
                    {modules.map((m) => (
                      <option key={m.moduleId} value={m.moduleId}>{m.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="lms-modal-footer">
            <button type="button" className="btn-lms btn-lms-secondary" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" disabled={loading || (actionType === 'assign' && !moduleId)} className="btn-lms btn-lms-primary">
              {loading ? 'Đang cập nhật...' : 'Áp dụng thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
