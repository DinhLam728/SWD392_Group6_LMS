import Dialog from './Dialog.jsx'

export default function AiUnavailableDialog({ onRetry, onCancel }) {
  return (
    <Dialog
      title="AI Service Unavailable"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="button" onClick={onRetry}>
            Retry
          </button>
        </>
      }
    >
      <p>
        Gemini could not generate the lesson content. The AI service is temporarily unavailable or
        returned an invalid response.
      </p>
      <p style={{ marginTop: '0.8rem' }}>
        Your lesson title and content have not been changed. You can try again or write the lesson
        content manually.
      </p>
    </Dialog>
  )
}
