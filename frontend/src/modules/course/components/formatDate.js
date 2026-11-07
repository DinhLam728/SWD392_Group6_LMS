// "2026-11-05T10:20:30" -> "05/11/2026", the same format as the student pages.
export function formatDate(value) {
  if (!value) {
    return '—'
  }
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}
