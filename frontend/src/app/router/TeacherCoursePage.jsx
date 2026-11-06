import { useParams } from 'react-router'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'

export default function TeacherCoursePage({ Page }) {
  const { courseId, moduleId, lessonId } = useParams()
  const ids = [courseId, moduleId, lessonId].filter(Boolean)
  if (ids.some((id) => !/^\d+$/.test(id))) return <NotFoundPage />

  return <Page
    key={ids.join('/')}
    courseId={courseId ? Number(courseId) : null}
    moduleId={moduleId ? Number(moduleId) : null}
    lessonId={lessonId ? Number(lessonId) : null}
  />
}
