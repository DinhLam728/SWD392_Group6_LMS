export default function Pagination({ page, size, totalElements, totalPages, noun, onPageChange }) {
  const first = totalElements === 0 ? 0 : page * size + 1
  const last = Math.min((page + 1) * size, totalElements)
  return (
    <nav className="tc-pagination" aria-label="Pagination">
      <p>
        Showing {first} - {last} of {totalElements} {noun}
      </p>
      <div className="tc-pagination-controls">
        <button
          type="button"
          className="tc-btn tc-btn-small"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
        >
          Previous
        </button>
        <span aria-current="page">
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="tc-btn tc-btn-small"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  )
}
