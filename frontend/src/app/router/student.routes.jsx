import PublicLayout from '../layouts/PublicLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import MyRegistrationsPage from '../../modules/enrollment/pages/MyRegistrationsPage.jsx'
import RegistrationResultPage from '../../modules/enrollment/pages/RegistrationResultPage.jsx'
import PaymentQrPage from '../../modules/payment/pages/PaymentQrPage.jsx'
import QuizStartPage from '../../modules/quiz/pages/QuizStartPage.jsx'
import QuizTakingPage from '../../modules/quiz/pages/QuizTakingPage.jsx'
import QuizResultPage from '../../modules/quiz/pages/QuizResultPage.jsx'
import LessonLearningPage from '../../modules/course/pages/LessonLearningPage.jsx'
import MyCoursesPage from '../../modules/course/pages/MyCoursesPage.jsx'
import PracticeQuizCreatePage from '../../modules/quiz/pages/PracticeQuizCreatePage.jsx'
import PracticeQuizListPage from '../../modules/quiz/pages/PracticeQuizListPage.jsx'

export const studentRoutes = [{
  element: <ProtectedRoute role="STUDENT" />,
  children: [{
    element: <PublicLayout />,
    children: [
      { path: '/registrations', element: <MyRegistrationsPage /> },
      { path: '/registrations/:id', element: <RegistrationResultPage /> },
      { path: '/registrations/:id/payment', element: <PaymentQrPage /> },
      { path: '/my-courses', element: <MyCoursesPage /> },
      { path: '/courses/:courseId/lessons/:lessonId', element: <LessonLearningPage /> },
      { path: '/modules/:moduleId/practice-quizzes', element: <PracticeQuizListPage /> },
      { path: '/modules/:moduleId/practice-quizzes/new', element: <PracticeQuizCreatePage /> },
      { path: '/quizzes/:quizId', element: <QuizStartPage /> },
      { path: '/quiz-attempts/:attemptId', element: <QuizTakingPage /> },
      { path: '/quiz-attempts/:attemptId/result', element: <QuizResultPage /> },
    ],
  }],
}]
