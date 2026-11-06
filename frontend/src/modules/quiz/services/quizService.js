import { enrollmentClient } from '../../enrollment/services/enrollmentClient.js'

// Dùng chung wrapper của enrollment để tự gắn token đăng nhập.
export const getQuiz = (quizId, signal) =>
  enrollmentClient(`quizzes/${quizId}`, { signal })

export const startAttempt = (quizId) =>
  enrollmentClient(`quizzes/${quizId}/attempts`, { method: 'POST' })

export const getAttempt = (attemptId, signal) =>
  enrollmentClient(`quiz-attempts/${attemptId}`, { signal })

export const submitAttempt = (attemptId, answers) =>
  enrollmentClient(`quiz-attempts/${attemptId}/submit`, {
    method: 'POST',
    body: { answers },
  })

export const getResult = (attemptId, signal) =>
  enrollmentClient(`quiz-attempts/${attemptId}/result`, { signal })

export const explainQuestion = (attemptId, questionId) =>
  enrollmentClient(
    `quiz-attempts/${attemptId}/questions/${questionId}/ai-explanation`,
    { method: 'POST' },
  )
