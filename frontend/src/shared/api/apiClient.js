import { ApiError } from './ApiError.js'

export function createApiClient({
  baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  fetchImpl = globalThis.fetch,
} = {}) {
  return async function apiClient(path, { query, body, headers, ...options } = {}) {
    if (typeof path !== 'string' || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) {
      throw new TypeError('API path must be relative')
    }
    const url = new URL(`${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`)
    for (const [key, value] of Object.entries(query || {})) {
      if (value == null) continue
      for (const item of Array.isArray(value) ? value : [value]) url.searchParams.append(key, item)
    }
    const requestHeaders = new Headers(headers)
    requestHeaders.set('Accept', 'application/json')
    const isFormData = body instanceof FormData
    if (isFormData) requestHeaders.delete('Content-Type')
    else if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')

    let response
    let text
    try {
      response = await fetchImpl(url, {
        credentials: 'include',
        ...options,
        headers: requestHeaders,
        ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
      })
      if (response.status === 204 && response.ok) return null
      text = await response.text()
    } catch (error) {
      if (error.name === 'AbortError') throw error
      throw new ApiError({ code: 'NETWORK_ERROR', message: 'Không thể kết nối đến máy chủ' })
    }

    let payload
    try {
      payload = JSON.parse(text)
    } catch {
      throw new ApiError({
        status: response.status,
        code: response.ok ? 'INVALID_RESPONSE' : 'HTTP_ERROR',
        message: response.ok ? 'Phản hồi máy chủ không hợp lệ' : 'Yêu cầu không thành công',
      })
    }
    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        code: typeof payload?.code === 'string' ? payload.code : 'HTTP_ERROR',
        message: typeof payload?.message === 'string' ? payload.message : 'Yêu cầu không thành công',
        errors: Array.isArray(payload?.errors) ? payload.errors : [],
      })
    }
    if (payload?.code !== 'SUCCESS' || typeof payload.message !== 'string'
      || !Object.hasOwn(payload, 'data')) {
      throw new ApiError({ status: response.status, code: 'INVALID_RESPONSE', message: 'Phản hồi máy chủ không hợp lệ' })
    }
    return payload
  }
}

export const apiClient = createApiClient()
