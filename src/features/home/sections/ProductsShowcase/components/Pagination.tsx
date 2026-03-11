interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full border border-[#DBE9F9] px-4 py-2 text-sm text-[#1F5CAB] disabled:opacity-50"
        aria-label="Vorherige Seite"
      >
        Previous
      </button>
      {pages.map((page) => {
        const isActive = page === currentPage
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={[
              'h-9 w-9 rounded-full text-sm font-semibold transition',
              isActive
                ? 'bg-orange-400 text-white'
                : 'bg-[#DBE9F9] text-[#1F5CAB] hover:bg-[#B9D4F3]',
            ].join(' ')}
            aria-label={`Seite ${page} anzeigen`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full border border-[#DBE9F9] px-4 py-2 text-sm text-[#1F5CAB] disabled:opacity-50"
        aria-label="Nächste Seite"
      >
        Next
      </button>
    </div>
  )
}
