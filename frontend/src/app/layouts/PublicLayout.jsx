import { useContext } from 'react'
import { AuthContext } from '../provider/AuthContext.js'
import SiteLayout from './SiteLayout.jsx'
import TeacherLayout from './TeacherLayout.jsx'

export default function PublicLayout() {
  const { user } = useContext(AuthContext)
  if (user?.role === 'TEACHER') return <TeacherLayout />
  const links = [{ to: '/courses', label: 'Khóa học' }]
  if (user?.role === 'STUDENT') {
    links.push({ to: '/registrations', label: 'Đăng ký của tôi' })
  }
  return <SiteLayout links={links} />
}
