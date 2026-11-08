import { courseImageUrl } from '../utils/courseImageUrl.js'
import { Link } from 'react-router'
import { useNavigate, useParams } from 'react-router'
import CourseOutline from '../components/CourseOutline.jsx'
import CourseCreatedAt from '../components/CourseCreatedAt.jsx'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../../app/provider/AuthContext.js'
import { getCourse } from '../services/courseService.js'
import { registerCourse } from '../../enrollment/services/registrationService.js'

export default function CourseDetailPage() {
  const { id } = useParams()
  if (!/^\d+$/.test(id)) return <p>Không tìm thấy trang.</p>
  return <CourseDetailPageContent key={id} id={id} />
}

function CourseDetailPageContent({ id }) {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    getCourse(id, controller.signal)
      .then(({ data }) => setDetail(data))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message)
        }
      })
    return () => controller.abort()
  }, [id])
  async function register() {
    setBusy(true)
    setError('')
    try {
      const { data } = await registerCourse(Number(id))
      navigate(`/registrations/${data.registrationId}/payment`)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <div
        className="breadcrumb registration-breadcrumb"
        aria-label="Đường dẫn trang"
      >
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Chi tiết khóa học</span>
      </div>
      {error && <p role="alert">{error}</p>}
      {!detail ? (
        <p>Đang tải khóa học...</p>
      ) : (
        <>
          <div className="two-columns course-detail-layout">
            <section className="course-overview">
              {detail.course.thumbnailUrl ? (
                <img
                  className="detail-cover"
                  src={courseImageUrl(detail.course.thumbnailUrl)}
                  alt=""
                />
              ) : (
                <div className="placeholder detail-cover">
                  <span className="cover-symbol">&lt;/&gt;</span>
                  <span>LMS ACADEMY · LEARN & GROW</span>
                </div>
              )}
              <h1>{detail.course.title}</h1>
              <p className="teacher-name">
                Giảng viên · {detail.course.teacherName}
              </p>
              <CourseCreatedAt value={detail.course.createdAt} />
              <h2>Giới thiệu</h2>
              <p>{detail.course.description}</p>
              <h2 id="course-outline" tabIndex={-1}>
                Nội dung khóa học
              </h2>
              <CourseOutline
                modules={detail.modules}
                courseId={id}
                canLearn={detail.registrationStatus === 'ACTIVE'}
              />
            </section>
            {user?.role === 'TEACHER' ? (
              <TeacherCourseCard course={detail.course} isOwner={detail.course.teacherId === user.userId} />
            ) : (
            <aside className="card enrollment-card">
              <span className="eyebrow">BẮT ĐẦU HÀNH TRÌNH</span>
              <h2>
                {detail.registrationStatus === 'ACTIVE'
                  ? 'Khóa học của bạn'
                  : 'Đăng ký khóa học'}
              </h2>
              <p className="price">
                {Number(detail.course.price).toLocaleString('vi-VN')} ₫
              </p>
              {detail.registrationStatus === 'ACTIVE' ? (
                <button
                  onClick={() => {
                    const firstLesson = detail.modules[0]?.lessons[0]
                    if (firstLesson) {
                      navigate(`/courses/${id}/lessons/${firstLesson.lessonId}`)
                      return
                    }
                    const outline = document.getElementById('course-outline')
                    outline?.focus({ preventScroll: true })
                    outline?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }}
                >
                  Khám phá ngay
                </button>
              ) : detail.registrationId ? (
                <Link
                  className="button"
                  to={`/registrations/${detail.registrationId}/payment`}
                >
                  Đăng ký khóa học
                </Link>
              ) : (
                <button disabled={busy} onClick={register}>
                  {busy ? 'Đang tạo đăng ký...' : 'Đăng ký khóa học'}
                </button>
              )}
              <p>
                {detail.registrationStatus === 'ACTIVE'
                  ? 'Bạn đã đăng ký thành công khóa học này.'
                  : 'Thanh toán bằng QR SePay. Thời hạn 24 giờ.'}
              </p>
            </aside>
            )}
          </div>
        </>
      )}
    </>
  )
}

function TeacherCourseCard({ course, isOwner }) {
  const price = <p className="price">{Number(course.price).toLocaleString('vi-VN')} ₫</p>

  if (!isOwner) {
    return (
      <aside className="card enrollment-card">
        {price}
        <Link className="button" to="/teacher/courses">
          Về khóa học của tôi
        </Link>
      </aside>
    )
  }

  return (
    <aside className="card enrollment-card">
      <span className="eyebrow">KHÓA HỌC CỦA BẠN</span>
      <h2>Bạn là giảng viên khóa học này</h2>
      {price}
      <Link className="button" to={'/teacher/courses/' + course.courseId + '/content'}>
        Quản lý khóa học
      </Link>
      <p>Chỉnh sửa thông tin, module và bài học của khóa học.</p>
    </aside>
  )
}
