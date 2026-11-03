import { enrollmentClient } from '../../enrollment/services/enrollmentClient.js'

export const getCourses = (query, signal) =>
  enrollmentClient('courses', { query, signal })
export const getCourse = (id, signal) =>
  enrollmentClient(`courses/${id}`, { signal })
