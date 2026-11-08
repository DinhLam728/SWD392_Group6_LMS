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
  }
}

export function clearDraft(attemptId) {
  try {
    localStorage.removeItem(draftKey(attemptId))
  } catch {
  }
}
