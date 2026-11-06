import { useId, useState } from 'react'
import Dialog from './Dialog.jsx'
import Notice from './Notice.jsx'

export default function ModuleDialog({ initialTitle = '', busy = false, error = '', onSubmit, onCancel }) {
  const inputId = useId()
  const [title, setTitle] = useState(initialTitle)
  const [touched, setTouched] = useState(false)
  const trimmed = title.trim()
  const invalid = trimmed.length === 0 || trimmed.length > 150

  function submit() {
    setTouched(true)
    if (!invalid) onSubmit(trimmed)
  }

  return (
    <Dialog
      title={initialTitle ? 'Edit module' : 'Add module'}
      onClose={busy ? () => {} : onCancel}
      footer={
        <>
          <button type="button" className="tc-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="tc-btn tc-btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : 'Save module'}
          </button>
        </>
      }
    >
      <div className="tc-field">
        <label htmlFor={inputId}>Module title *</label>
        <input
          id={inputId}
          className="tc-input"
          value={title}
          maxLength={150}
          aria-invalid={touched && invalid}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit()
          }}
        />
        <div className="tc-field-meta">
          <span className="tc-field-error">
            {touched && invalid ? 'Module title is required (max 150 characters).' : ''}
          </span>
          <span>{title.length} / 150</span>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </Dialog>
  )
}
