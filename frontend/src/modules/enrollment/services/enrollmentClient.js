import { apiClient } from '../../../shared/api/apiClient.js'

export function enrollmentClient(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = localStorage.getItem('lms_token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return apiClient(path, { ...options, headers })
}
