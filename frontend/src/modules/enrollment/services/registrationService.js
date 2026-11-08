import { enrollmentClient } from './enrollmentClient.js'

export const registerCourse = (courseId) =>
  enrollmentClient('registrations', { method: 'POST', body: { courseId } })
export const getRegistration = (id, signal) =>
  enrollmentClient(`registrations/${id}`, { signal })
export const simulatePayment = (id) =>
  enrollmentClient(`registrations/${id}/demo-payment`, { method: 'POST' })
export const getRegistrations = (query, signal) =>
  enrollmentClient('registrations', { query, signal })
