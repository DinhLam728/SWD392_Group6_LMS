import { createBrowserRouter } from 'react-router'
import { publicRoutes } from './public.routes.jsx'
import { studentRoutes } from './student.routes.jsx'
import { teacherRoutes } from './teacher.routes.jsx'

export const router = createBrowserRouter([
  ...publicRoutes,
  ...studentRoutes,
  ...teacherRoutes,
])
