export interface BlogPostCategory {
  name: string
  slug: string
}

export interface BlogPostTag {
  name: string
  slug: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: { src: string; alt: string }
  publishedAt: string
  readingTimeMin?: number
  category?: string
  author?: string
  /** Full HTML content (only when fetching single post). */
  content?: string
  /** All categories (only when fetching single post). */
  categories?: BlogPostCategory[]
  /** Tags (only when WP provides them). */
  tags?: BlogPostTag[]
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
