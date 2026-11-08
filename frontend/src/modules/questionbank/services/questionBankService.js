import { apiClient } from '../../../shared/api/apiClient.js'

export async function getCourseQuestions(courseId, {
  page = 0,
  size = 10,
  sort,
  moduleId,
  assignedOnly,
  unassignedOnly,
  keyword,
  difficulty,
  topic,
} = {}) {
  const query = { page, size }
  if (sort) query.sort = sort
  if (moduleId) query.moduleId = moduleId
  if (assignedOnly) query.assignedOnly = true
  if (unassignedOnly) query.unassignedOnly = true
  if (topic && topic !== 'ALL') query.topic = topic
  if (difficulty && difficulty !== 'ALL') query.difficulty = difficulty
  if (keyword && keyword.trim()) query.keyword = keyword.trim()

  return apiClient(`courses/${courseId}/questions`, { query })
}

export async function getQuestionBankStats(courseId) {
  const res = await apiClient(`courses/${courseId}/question-bank/stats`)
  return res.data
}

export async function getQuestionDetail(questionId) {
  return apiClient(`questions/${questionId}`)
}

export async function createQuestion(data) {
  return apiClient('questions', { method: 'POST', body: data })
}

export async function updateQuestion(questionId, data) {
  return apiClient(`questions/${questionId}`, { method: 'PUT', body: data })
}

export async function deleteQuestion(questionId) {
  return apiClient(`questions/${questionId}`, { method: 'DELETE' })
}

export async function bulkDeleteQuestions(questionIds) {
  return apiClient('question-bank/bulk-delete', {
    method: 'POST',
    body: { questionIds },
  })
}

export async function getCourseModules(courseId) {
  const res = await apiClient(`courses/${courseId}/question-bank/modules`)
  return res?.data || []
}

export async function bulkAssignModule(questionIds, moduleId) {
  return apiClient('question-bank/bulk-assign', {
    method: 'POST',
    body: { questionIds, moduleId },
  })
}

export async function generateAiQuestions(params) {
  return apiClient('question-bank/generate-ai', {
    method: 'POST',
    body: params,
  })
}

export async function batchSaveQuestions(questionsList) {
  return apiClient('question-bank/batch-save', {
    method: 'POST',
    body: {
      courseId: questionsList[0]?.courseId || 1,
      moduleId: questionsList[0]?.moduleId || null,
      questions: questionsList,
    },
  })
}

export function exportBankToJson(courseId, questions = []) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `question_bank_course_${courseId}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}
