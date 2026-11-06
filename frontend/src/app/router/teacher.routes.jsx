import { Navigate } from 'react-router'
import { QuestionBankPage } from '../../modules/questionbank/pages/QuestionBankPage.jsx'
import TeacherLayout from '../layouts/TeacherLayout.jsx'
import TeacherCoursePage from './TeacherCoursePage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import TeacherCourseLayout from '../../modules/course/components/TeacherLayout.jsx'
import { CourseContentPage } from '../../modules/course/pages/CourseContentPage.jsx'
import { CourseFormPage } from '../../modules/course/pages/CourseFormPage.jsx'
import { LessonFormPage } from '../../modules/course/pages/LessonFormPage.jsx'
import { TeacherCoursesPage } from '../../modules/course/pages/TeacherCoursesPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'

export const teacherRoutes = [{
  element: <ProtectedRoute role="TEACHER" />,
  children: [{
    path: '/teacher',
    element: <TeacherCourseLayout />,
    children: [
      { index: true, element: <Navigate to="courses" replace /> },
      { path: 'courses', element: <TeacherCoursesPage /> },
      { path: 'courses/new', element: <CourseFormPage /> },
      { path: 'courses/:courseId/edit', element: <TeacherCoursePage Page={CourseFormPage} /> },
      { path: 'courses/:courseId/content', element: <TeacherCoursePage Page={CourseContentPage} /> },
      { path: 'courses/:courseId/modules/:moduleId/lessons/new', element: <TeacherCoursePage Page={LessonFormPage} /> },
      { path: 'courses/:courseId/lessons/:lessonId/edit', element: <TeacherCoursePage Page={LessonFormPage} /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  }, {
    element: <TeacherLayout />,
    children: [
      { path: '/question-bank', element: <QuestionBankPage /> },
      { path: '/questions', element: <Navigate to="/question-bank" replace /> },
    ],
  }],
}]
