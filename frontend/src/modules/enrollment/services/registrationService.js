import { enrollmentClient } from './enrollmentClient.js'

export const registerCourse = (courseId) =>
  enrollmentClient('registrations', { method: 'POST', body: { courseId } })
export const getRegistration = (id, signal) =>
  enrollmentClient(`registrations/${id}`, { signal })
export const getRegistrations = (query, signal) =>
  enrollmentClient('registrations', { query, signal })
