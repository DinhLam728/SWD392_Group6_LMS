import { navigate } from '../../../app/router/useHashPath.js'
import { apiClient } from '../../../shared/api/apiClient.js'

// Teacher endpoints always need the logged-in user's token; there is no demo-user fallback here.
async function teacherApi(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = localStorage.getItem('lms_token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  try {
    return await apiClient(`teacher/${path}`, { ...options, headers })
  } catch (error) {
    if (error?.status === 401) {
      // The token is missing or expired: forget it and let the Teacher log in again.
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      navigate('/login')
    }
    throw error
  }
}

export const listMyCourses = ({ keyword, status, sort, page, size }, signal) =>
  teacherApi('courses', {
    query: { keyword: keyword || undefined, status: status || undefined, sort: sort || undefined, page, size },
    signal,
  })

export const getCourse = (courseId, signal) => teacherApi(`courses/${courseId}`, { signal })
export const createCourse = (body) => teacherApi('courses', { method: 'POST', body })
export const updateCourse = (courseId, body) =>
  teacherApi(`courses/${courseId}`, { method: 'PUT', body })
export const deleteCourse = (courseId) => teacherApi(`courses/${courseId}`, { method: 'DELETE' })
export const publishCourse = (courseId) =>
  teacherApi(`courses/${courseId}/publish`, { method: 'PATCH' })
export const unpublishCourse = (courseId) =>
  teacherApi(`courses/${courseId}/unpublish`, { method: 'PATCH' })

export const getCourseContent = (courseId, signal) =>
  teacherApi(`courses/${courseId}/content`, { signal })

export const createModule = (courseId, body) =>
  teacherApi(`courses/${courseId}/modules`, { method: 'POST', body })
export const updateModule = (moduleId, body) =>
  teacherApi(`modules/${moduleId}`, { method: 'PUT', body })
export const deleteModule = (moduleId) => teacherApi(`modules/${moduleId}`, { method: 'DELETE' })
export const moveModule = (moduleId, direction) =>
  teacherApi(`modules/${moduleId}/move`, { method: 'PATCH', query: { direction } })

export const getLesson = (lessonId, signal) => teacherApi(`lessons/${lessonId}`, { signal })
export const createLesson = (moduleId, body) =>
  teacherApi(`modules/${moduleId}/lessons`, { method: 'POST', body })
export const updateLesson = (lessonId, body) =>
  teacherApi(`lessons/${lessonId}`, { method: 'PUT', body })
export const deleteLesson = (lessonId) => teacherApi(`lessons/${lessonId}`, { method: 'DELETE' })
export const moveLesson = (lessonId, direction) =>
  teacherApi(`lessons/${lessonId}/move`, { method: 'PATCH', query: { direction } })

// Returns a draft only; the lesson is stored when the Teacher saves the form.
export const generateLessonContent = (body, signal) =>
  teacherApi('ai-lesson', { method: 'POST', body, signal })
