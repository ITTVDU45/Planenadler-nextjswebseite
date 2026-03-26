'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Seitennavigation" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Vorherige Seite"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE9F9] text-[#1F5CAB] transition hover:bg-[#DBE9F9] disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      {pages.map((page) => {
        const isActive = page === currentPage
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition',
              isActive
                ? 'bg-[#1F5CAB] text-white'
                : 'text-[#1F5CAB] hover:bg-[#DBE9F9]',
            ].join(' ')}
          >
            {page}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Nächste Seite"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE9F9] text-[#1F5CAB] transition hover:bg-[#DBE9F9] disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}
