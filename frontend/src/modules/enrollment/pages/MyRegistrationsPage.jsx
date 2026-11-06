import { Link } from 'react-router'
import { useSearchParams } from 'react-router'
import { formatRegistrationId } from '../utils/formatRegistrationId.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { useEffect, useState } from 'react'
import { getRegistrations } from '../services/registrationService.js'

export default function MyRegistrationsPage() {
  const [params] = useSearchParams()
  return (
    <MyRegistrationsPageContent
      key={params.toString()}
      initialKeyword={params.get('keyword') || ''}
    />
  )
}

function MyRegistrationsPageContent({ initialKeyword }) {
  const [query, setQuery] = useState({
    page: 0,
    size: 7,
    sort: 'registeredAt,desc',
    keyword: initialKeyword,
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    getRegistrations(query, controller.signal)
      .then(({ data }) => {
        setResult(data)
        setError('')
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e.message)
        }
      })
    return () => controller.abort()
  }, [query])
  function search(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setQuery({
      page: 0,
      size: 7,
      sort: values.sort,
      keyword: values.keyword,
      status: values.status || undefined,
      paymentStatus: values.paymentStatus || undefined,
    })
  }
  function resetFilters(event) {
    event.preventDefault()
    const fields = event.currentTarget.elements
    fields.namedItem('keyword').value = ''
    fields.namedItem('status').value = ''
    fields.namedItem('paymentStatus').value = ''
    fields.namedItem('sort').value = 'registeredAt,desc'
    setError('')
    setResult(null)
    setQuery({ page: 0, size: 7, sort: 'registeredAt,desc' })
  }
  return (
    <>
      <div
        className="breadcrumb registration-breadcrumb"
        aria-label="Đường dẫn trang"
      >
        <Link to="/courses">Khóa học</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Đăng ký của tôi</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">HÀNH TRÌNH CỦA BẠN</span>
        <h1>Đăng ký của tôi</h1>
        <p>Theo dõi đăng ký, thanh toán và các khóa học đã được kích hoạt.</p>
      </div>
      <form className="filters" onSubmit={search} onReset={resetFilters}>
        <label>
          Tìm kiếm
          <input
            name="keyword"
            placeholder="Tên khóa học hoặc ID"
            defaultValue={initialKeyword}
          />
        </label>
        <label>
          Đăng ký
          <select name="status">
            <option value="">Tất cả</option>
            {['PENDING', 'ACTIVE', 'EXPIRED'].map((s) => (
              <option key={s} value={s}>
                {
                  {
                    PENDING: 'Đang chờ',
                    ACTIVE: 'Đã kích hoạt',
                    EXPIRED: 'Đã hết hạn',
                    SUCCESS: 'Thành công',
                    FAILED: 'Thất bại',
                  }[s]
                }
              </option>
            ))}
          </select>
        </label>
        <label>
          Thanh toán
          <select name="paymentStatus">
            <option value="">Tất cả</option>
            {['PENDING', 'SUCCESS', 'FAILED'].map((s) => (
              <option key={s} value={s}>
                {
                  {
                    PENDING: 'Đang chờ',
                    ACTIVE: 'Đã kích hoạt',
                    EXPIRED: 'Đã hết hạn',
                    SUCCESS: 'Thành công',
                    FAILED: 'Thất bại',
                  }[s]
                }
              </option>
            ))}
          </select>
        </label>
        <label>
          Ngày đăng ký
          <select name="sort" defaultValue="registeredAt,desc">
            <option value="registeredAt,desc">Mới nhất</option>
            <option value="registeredAt,asc">Cũ nhất</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Lọc</button>
          <button type="reset" className="button-secondary">Đặt lại</button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      {result ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khóa học</th>
                  <th>Ngày đăng ký</th>
                  <th>Số tiền</th>
                  <th>Đăng ký</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((r) => (
                  <tr key={r.registrationId}>
                    <td>{formatRegistrationId(r.registrationId)}</td>
                    <td>{r.courseTitle}</td>
                    <td>{r.registeredAt?.replace('T', ' ')}</td>
                    <td>{Number(r.amount).toLocaleString('vi-VN')} ₫</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <StatusBadge status={r.paymentStatus} />
                    </td>
                    <td>
                      <Link
                        className={
                          r.status === 'PENDING'
                            ? 'button'
                            : 'button button-secondary'
                        }
                        to={`/registrations/${r.registrationId}${r.status === 'PENDING' ? '/payment' : ''}`}
                      >
                        {r.status === 'PENDING'
                          ? 'Tiếp tục thanh toán'
                          : 'Xem kết quả'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result.items.length && <p>Chưa có đăng ký phù hợp.</p>}
          <div className="pagination">
            <button
              disabled={query.page === 0}
              onClick={() => setQuery({ ...query, page: query.page - 1 })}
            >
              Trước
            </button>
            {Array.from({ length: result.totalPages }, (_, page) => (
              <button
                key={page}
                className="page-number"
                aria-label={`Trang ${page + 1}`}
                aria-current={query.page === page ? 'page' : undefined}
                onClick={() => setQuery({ ...query, page })}
              >
                {page + 1}
              </button>
            ))}
            <button
              disabled={query.page + 1 >= result.totalPages}
              onClick={() => setQuery({ ...query, page: query.page + 1 })}
            >
              Sau
            </button>
          </div>
        </>
      ) : (
        !error && <p>Đang tải...</p>
      )}
    </>
  )
}
