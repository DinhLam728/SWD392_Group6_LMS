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
      title={initialTitle ? 'Sửa module' : 'Thêm module'}
      onClose={busy ? () => {} : onCancel}
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onCancel} disabled={busy}>
            Hủy
          </button>
          <button type="button" className="button" onClick={submit} disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu module'}
          </button>
        </>
      }
    >
      <div className="tc-field">
        <label htmlFor={inputId}>Tên module *</label>
        <input
          id={inputId}
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
            {touched && invalid ? 'Tên module là bắt buộc (tối đa 150 ký tự).' : ''}
          </span>
          <span>{title.length} / 150</span>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </Dialog>
  )
}
