export function Pagination({
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalElements === 0) {
    return null
  }

  const startItem = page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, totalElements)

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = []
    const total = totalPages || 1

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 3) {
        pages.push(0, 1, 2, 3, 4, 'ellipsis', total - 1)
      } else if (page >= total - 4) {
        pages.push(0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1)
      } else {
        pages.push(0, 'ellipsis', page - 1, page, page + 1, 'ellipsis', total - 1)
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="lms-pagination">
      <div className="lms-pagination-info">
        <div>
          Showing <strong>{startItem} - {endItem}</strong> of <strong>{totalElements}</strong> questions
        </div>

        <div className="lms-page-size-selector">
          <span>Per page:</span>
          <select
            className="lms-page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="lms-pagination-controls">
        {/* First page button */}
        <button
          type="button"
          className="btn-page-nav"
          title="First page"
          disabled={page === 0}
          onClick={() => onPageChange(0)}
        >
          «
        </button>

        {/* Previous page button */}
        <button
          type="button"
          className="btn-page-nav"
          title="Previous page"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>

        {/* Numbered buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span key={`ellipsis-${idx}`} className="btn-page-nav ellipsis">
                &hellip;
              </span>
            )
          }

          const isActive = p === page
          return (
            <button
              key={p}
              type="button"
              className={`btn-page-nav ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              title={`Page ${p + 1}`}
            >
              {p + 1}
            </button>
          )
        })}

        {/* Next page button */}
        <button
          type="button"
          className="btn-page-nav"
          title="Next page"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>

        {/* Last page button */}
        <button
          type="button"
          className="btn-page-nav"
          title="Last page"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
        >
          »
        </button>
      </div>
    </div>
  )
}
