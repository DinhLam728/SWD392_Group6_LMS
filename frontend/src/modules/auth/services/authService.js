import { apiClient } from '../../../shared/api/apiClient.js'

export function loginApi(credentials) {
  return apiClient('auth/login', {
    method: 'POST',
    body: credentials,
  })
}

export function googleLoginApi(idToken) {
  return apiClient('auth/google', {
    method: 'POST',
    body: { idToken },
  })
}

export function registerApi(data) {
  return apiClient('auth/register', {
    method: 'POST',
    body: data,
  })
}

export function verifyOtpApi(data) {
  return apiClient('auth/verify-otp', {
    method: 'POST',
    body: data,
  })
}

export function resendOtpApi(email) {
  return apiClient('auth/resend-otp', {
    method: 'POST',
    body: { email },
  })
}

export function forgotPasswordApi(data) {
  return apiClient('auth/forgot-password', {
    method: 'POST',
    body: data,
  })
}

export function validateResetOtpApi(data) {
  return apiClient('auth/validate-reset-otp', {
    method: 'POST',
    body: data,
  })
}

export function resetPasswordApi(data) {
  return apiClient('auth/reset-password', {
    method: 'POST',
    body: data,
  })
}
