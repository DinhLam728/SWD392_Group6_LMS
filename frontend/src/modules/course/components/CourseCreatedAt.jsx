export default function CourseCreatedAt({ value }) {
  const date = value?.slice(0, 10).split('-').reverse().join('/')
  return (
    <p className="course-created-at">
      Ngày tạo: {value ? <time dateTime={value}>{date}</time> : 'Chưa ghi nhận'}
    </p>
  )
}
