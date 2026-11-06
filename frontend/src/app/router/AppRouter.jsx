import { useEffect } from 'react'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'
import TeacherLayout from '../../modules/course/components/TeacherLayout.jsx'
import { CourseContentPage } from '../../modules/course/pages/CourseContentPage.jsx'
import { CourseFormPage } from '../../modules/course/pages/CourseFormPage.jsx'
import { LessonFormPage } from '../../modules/course/pages/LessonFormPage.jsx'
import { TeacherCoursesPage } from '../../modules/course/pages/TeacherCoursesPage.jsx'
import { navigate, useHashPath } from './useHashPath.js'

// Each entry: [pattern, render(captured ids)]. Other modules add their own routes here.
const ROUTES = [
  [/^\/teacher\/courses$/, () => <TeacherCoursesPage />],
  [/^\/teacher\/courses\/new$/, () => <CourseFormPage />],
  [/^\/teacher\/courses\/(\d+)\/edit$/, ([id]) => <CourseFormPage key={id} courseId={Number(id)} />],
  [/^\/teacher\/courses\/(\d+)\/content$/, ([id]) => <CourseContentPage key={id} courseId={Number(id)} />],
  [
    /^\/teacher\/courses\/(\d+)\/modules\/(\d+)\/lessons\/new$/,
    ([courseId, moduleId]) => (
      <LessonFormPage key={`new-${moduleId}`} courseId={Number(courseId)} moduleId={Number(moduleId)} />
    ),
  ],
  [
    /^\/teacher\/courses\/(\d+)\/lessons\/(\d+)\/edit$/,
    ([courseId, lessonId]) => (
      <LessonFormPage key={`edit-${lessonId}`} courseId={Number(courseId)} lessonId={Number(lessonId)} />
    ),
  ],
]

export default function AppRouter() {
  const path = useHashPath()

  useEffect(() => {
    if (path === '/') navigate('/teacher/courses')
  }, [path])

  let page = <NotFoundPage />
  for (const [pattern, render] of ROUTES) {
    const match = pattern.exec(path)
    if (match) {
      page = render(match.slice(1))
      break
    }
  }
  return <TeacherLayout>{page}</TeacherLayout>
}
