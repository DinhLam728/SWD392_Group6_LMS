import { Navigate } from 'react-router'
import { QuestionBankPage } from '../../modules/questionbank/pages/QuestionBankPage.jsx'
import TeacherLayout from '../layouts/TeacherLayout.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

export const teacherRoutes = [{
  element: <ProtectedRoute role="TEACHER" />,
  children: [{
    element: <TeacherLayout />,
    children: [
      { path: '/question-bank', element: <QuestionBankPage /> },
      { path: '/questions', element: <Navigate to="/question-bank" replace /> },
    ],
  }],
}]
