import { Icon } from '../Icon'

const buildRange = (current, totalPages) => {
  const pages = []
  const push = (value) => pages.push(value)

  push(1)
  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)

  if (start > 2) push('…')
  for (let page = start; page <= end; page += 1) push(page)
  if (end < totalPages - 1) push('…')
  if (totalPages > 1) push(totalPages)

  return pages
}

export function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  if (totalPages <= 1) return null

  const pages = buildRange(currentPage, totalPages)

  const arrow = (dir, page, disabled) => (
    <button
      className="app-panel app-focus grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:text-[var(--brand)] disabled:opacity-40"
      onClick={() => onPageChange(page)}
      disabled={disabled}
      type="button"
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
    >
      <Icon
        name={dir === 'prev' ? 'chevronLeft' : 'chevronRight'}
        className="h-5 w-5 rtl:-scale-x-100"
      />
    </button>
  )

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      {arrow('prev', currentPage - 1, currentPage <= 1)}

      {pages.map((page, index) =>
        page === '…' ? (
          <span key={`gap-${index}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={page}
            className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
              page === currentPage
                ? 'app-button-primary'
                : 'app-panel text-muted hover:text-[var(--brand)]'
            }`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ),
      )}

      {arrow('next', currentPage + 1, currentPage >= totalPages)}
    </nav>
  )
}
