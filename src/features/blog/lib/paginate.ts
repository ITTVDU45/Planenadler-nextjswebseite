import type { PaginatedResult } from '../types'

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number
): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * perPage
  const slice = items.slice(start, start + perPage)

  return {
    items: slice,
    total,
    page: safePage,
    perPage,
    totalPages,
  }
}
