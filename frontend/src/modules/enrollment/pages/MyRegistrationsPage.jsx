import { useEffect, useState } from 'react'
import { getRegistrations } from '../services/registrationService.js'

export default function MyRegistrationsPage() {
  const [query, setQuery] = useState({ page: 0 })
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
      keyword: values.keyword,
      status: values.status || undefined,
      paymentStatus: values.paymentStatus || undefined,
    })
  }
  return (
    <>
      <h1>Đăng ký của tôi</h1>
      <form className="filters" onSubmit={search}>
        <label>
          Tìm kiếm
          <input name="keyword" placeholder="Tên khóa học hoặc ID" />
        </label>
        <label>
          Đăng ký
          <select name="status">
            <option value="">Tất cả</option>
            {['PENDING', 'ACTIVE', 'EXPIRED'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Thanh toán
          <select name="paymentStatus">
            <option value="">Tất cả</option>
            {['PENDING', 'SUCCESS', 'FAILED'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button>Lọc</button>
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
                  <th>Số tiền</th>
                  <th>Đăng ký</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((r) => (
                  <tr key={r.registrationId}>
                    <td>#{r.registrationId}</td>
                    <td>{r.courseTitle}</td>
                    <td>{Number(r.amount).toLocaleString('vi-VN')} ₫</td>
                    <td>{r.status}</td>
                    <td>{r.paymentStatus}</td>
                    <td>
                      <a
                        href={`#/registrations/${r.registrationId}${r.status === 'PENDING' ? '/payment' : ''}`}
                      >
                        {r.status === 'PENDING'
                          ? 'Tiếp tục thanh toán'
                          : 'Xem kết quả'}
                      </a>
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
            <span>Trang {query.page + 1}</span>
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
