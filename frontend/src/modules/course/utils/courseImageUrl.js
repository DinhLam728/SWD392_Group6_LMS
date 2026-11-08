export function courseImageUrl(value) {
  if (!value?.startsWith('/api/v1/course-images/')) return value
  const apiBase = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
  return new URL(value, apiBase).href
}
