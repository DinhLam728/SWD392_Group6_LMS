import { Navigate } from 'react-router'
import AvailableCoursesPage from '../../modules/course/pages/AvailableCoursesPage.jsx'
import PublicLayout from '../layouts/PublicLayout.jsx'
import AuthPage from '../../modules/auth/pages/AuthPage.jsx'
import CourseDetailPage from '../../modules/course/pages/CourseDetailPage.jsx'

export const publicRoutes = [
  { path: '/login', element: <AuthPage /> },
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Navigate to="/courses" replace /> },
      { path: '/courses', element: <AvailableCoursesPage /> },
      { path: '/courses/:id', element: <CourseDetailPage /> },
      { path: '*', element: <p>Không tìm thấy trang.</p> },
    ],
  },
]
