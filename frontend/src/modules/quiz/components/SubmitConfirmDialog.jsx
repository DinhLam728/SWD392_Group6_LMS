import { useEffect, useRef } from 'react'

export default function SubmitConfirmDialog({ open, unanswered, submitting, onCancel, onConfirm }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="quiz-dialog"
      onCancel={(event) => {
        event.preventDefault()
        if (!submitting) onCancel()
      }}
    >
      <h2>Nộp bài?</h2>
      {unanswered > 0 ? (
        <p>
          Bạn còn <strong>{unanswered}</strong> câu chưa trả lời. Câu bỏ trống
          sẽ được tính là sai.
        </p>
      ) : (
        <p>Bạn đã trả lời tất cả câu hỏi.</p>
      )}
      <p className="muted">Sau khi nộp, bạn không thể sửa đáp án.</p>
      <div className="quiz-dialog-actions">
        <button type="button" className="button-secondary" onClick={onCancel} disabled={submitting}>
          Tiếp tục làm bài
        </button>
        <button type="button" onClick={onConfirm} disabled={submitting}>
          {submitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </div>
    </dialog>
  )
}
