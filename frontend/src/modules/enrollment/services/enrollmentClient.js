import { apiClient } from '../../../shared/api/apiClient.js'

// The header is only for the backend's explicit development profile.
export function enrollmentClient(path, options = {}) {
  const demoUserId = import.meta.env.DEV
    ? import.meta.env.VITE_DEMO_USER_ID
    : null
  const headers = new Headers(options.headers)
  if (demoUserId) {
    headers.set('X-User-Id', demoUserId)
  }
  return apiClient(path, { ...options, headers })
}
