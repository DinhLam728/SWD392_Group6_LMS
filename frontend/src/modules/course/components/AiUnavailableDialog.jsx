import Dialog from './Dialog.jsx'

export default function AiUnavailableDialog({ onRetry, onCancel }) {
  return (
    <Dialog
      title="Dịch vụ AI không khả dụng"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button type="button" className="button" onClick={onRetry}>
            Thử lại
          </button>
        </>
      }
    >
      <p>
        Gemini không thể tạo nội dung bài học. Dịch vụ AI tạm thời không khả dụng hoặc trả về phản hồi
        không hợp lệ.
      </p>
      <p style={{ marginTop: '0.8rem' }}>
        Tiêu đề và nội dung bài học của bạn chưa bị thay đổi. Bạn có thể thử lại hoặc tự viết nội dung
        bài học.
      </p>
    </Dialog>
  )
}
