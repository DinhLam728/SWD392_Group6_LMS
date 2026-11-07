// "Showing 1–10 of 23 courses", the same line as the student course list.
export function ResultCount({ page, size, totalElements, noun }) {
  const first = totalElements === 0 ? 0 : page * size + 1
  const last = Math.min((page + 1) * size, totalElements)
  return (
    <p className="course-count" role="status">
      Showing{' '}
      <strong>
        {first}–{last}
      </strong>{' '}
      of <strong>{totalElements}</strong> {noun}
    </p>
  )
}

// Same markup as the shared pagination: Previous, one button per page, Next.
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 0) {
    return null
  }
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          type="button"
          className="page-number"
          aria-label={`Page ${index + 1}`}
          aria-current={index === page ? 'page' : undefined}
          onClick={() => onPageChange(index)}
        >
          {index + 1}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}
