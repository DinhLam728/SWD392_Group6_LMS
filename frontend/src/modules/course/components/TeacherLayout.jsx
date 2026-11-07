import { Outlet } from 'react-router'
import SiteLayout from '../../../app/layouts/SiteLayout.jsx'
import './teacherCourse.css'

export default function TeacherLayout() {
  return <SiteLayout home="/teacher/courses" links={[
    { to: '/courses', label: 'Khóa học' },
    { to: '/teacher/courses', label: 'Quản lý khóa học' },
    { to: '/question-bank', label: 'Ngân hàng câu hỏi' },
  ]}>
    <div className="tc-page"><Outlet /></div>
  </SiteLayout>
}
