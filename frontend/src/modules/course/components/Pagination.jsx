export function ResultCount({ page, size, totalElements, noun }) {
  const first = totalElements === 0 ? 0 : page * size + 1
  const last = Math.min((page + 1) * size, totalElements)
  return (
    <p className="course-count" role="status">
      Hiển thị{' '}
      <strong>
        {first}–{last}
      </strong>{' '}
      trên tổng số <strong>{totalElements}</strong> {noun}
    </p>
  )
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 0) {
    return null
  }
  return (
    <nav className="pagination" aria-label="Phân trang">
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        Trước
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          type="button"
          className="page-number"
          aria-label={`Trang ${index + 1}`}
          aria-current={index === page ? 'page' : undefined}
          onClick={() => onPageChange(index)}
        >
          {index + 1}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        Sau
      </button>
    </nav>
  )
}
