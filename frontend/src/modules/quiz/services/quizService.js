import { enrollmentClient } from '../../enrollment/services/enrollmentClient.js'

export const getPracticeQuizSetup = (moduleId, signal) =>
  enrollmentClient(`modules/${moduleId}/practice-quizzes/setup`, { signal })

export const createPracticeQuiz = (moduleId, body) =>
  enrollmentClient(`modules/${moduleId}/practice-quizzes`, { method: 'POST', body })

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
