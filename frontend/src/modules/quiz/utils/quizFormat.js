// Backend trả LocalDateTime dạng "2026-11-05T09:30:00" (giờ Việt Nam, không kèm múi giờ).
export function formatDateTime(value) {
  if (!value) return '—'
  const [date, time = ''] = value.split('T')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} ${time.slice(0, 5)}`
}

export function formatScore(score) {
  if (score === null || score === undefined) return '—'
  return Number(score).toFixed(2)
}

export function parseServerTime(value) {
  return new Date(value).getTime()
}

// Bản nháp đáp án chỉ lưu trên trình duyệt này, để tải lại trang không mất bài.
const draftKey = (attemptId) => `lms_quiz_draft_${attemptId}`

export function loadDraft(attemptId) {
  try {
    return JSON.parse(localStorage.getItem(draftKey(attemptId))) || {}
  } catch {
    return {}
  }
}

export function saveDraft(attemptId, answers) {
  try {
    localStorage.setItem(draftKey(attemptId), JSON.stringify(answers))
  } catch {
    // Trình duyệt chặn lưu trữ: bỏ qua, bài vẫn làm được.
  }
}

export function clearDraft(attemptId) {
  try {
    localStorage.removeItem(draftKey(attemptId))
  } catch {
    // Bỏ qua.
  }
}
