import SiteLayout from './SiteLayout.jsx'

export default function TeacherLayout() {
  return <SiteLayout links={[
    { to: '/courses', label: 'Khóa học' },
    { to: '/teacher/courses', label: 'Quản lý khóa học' },
    { to: '/question-bank', label: 'Ngân hàng câu hỏi' },
  ]} />
}
