import { useEffect, useId, useRef } from 'react'

export default function Dialog({ title, onClose, children, footer }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="tc-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onMouseDown={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="tc-dialog-head">
        <h2 id={titleId}>{title}</h2>
      </div>
      <div className="tc-dialog-body">{children}</div>
      <div className="tc-dialog-foot">{footer}</div>
    </dialog>
  )
}
