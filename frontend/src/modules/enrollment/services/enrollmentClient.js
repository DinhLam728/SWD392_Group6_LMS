import { apiClient } from '../../../shared/api/apiClient.js'

export function enrollmentClient(path, options = {}) {
  return apiClient(path, options)
}
