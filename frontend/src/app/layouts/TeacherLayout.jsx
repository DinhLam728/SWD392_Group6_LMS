import SiteLayout from './SiteLayout.jsx'

export default function TeacherLayout() {
  return <SiteLayout home="/question-bank" links={[
    { to: '/courses', label: 'Khóa học' },
    { to: '/question-bank', label: 'Ngân hàng câu hỏi' },
  ]} />
}
