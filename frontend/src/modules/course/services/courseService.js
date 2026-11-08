import { enrollmentClient } from '../../enrollment/services/enrollmentClient.js'

export const getCourses = (query, signal) =>
  enrollmentClient('courses', { query, signal })
export const getCourse = (id, signal) =>
  enrollmentClient(`courses/${id}`, { signal })
export const getCourseLesson = (courseId, lessonId, signal) =>
  enrollmentClient(`courses/${courseId}/lessons/${lessonId}`, { signal })
