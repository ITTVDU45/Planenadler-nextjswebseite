import type { BlogPost, PaginatedResult } from './types'
import { paginate } from './lib/paginate'
import { BLOG_POSTS_MOCK } from './data/blogPosts.mock'
import { fetchAllBlogPostsFromAPI, fetchPostBySlugFromAPI } from './api'

/** Normalisiert Kategoriename zu Slug (für Filter-Vergleich). */
function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export interface BlogCategoryFilter {
  name: string
  slug: string
}

/**
 * Ermittelt eindeutige Kategorien aus allen Posts (für Filter-Badges).
 * Nutzt post.categories falls vorhanden, sonst post.category.
 */
export function getUniqueCategoriesFromPosts(posts: BlogPost[]): BlogCategoryFilter[] {
  const bySlug = new Map<string, string>()
  for (const post of posts) {
    if (post.categories?.length) {
      for (const c of post.categories) {
        if (c.slug && !bySlug.has(c.slug)) bySlug.set(c.slug, c.name)
      }
    } else if (post.category) {
      const slug = categoryToSlug(post.category)
      if (slug && !bySlug.has(slug)) bySlug.set(slug, post.category)
    }
  }
  return Array.from(bySlug.entries(), ([slug, name]) => ({ name, slug })).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

/** Prüft, ob ein Post zur Kategorie (Slug) gehört. */
export function postMatchesCategorySlug(post: BlogPost, categorySlug: string): boolean {
  if (post.categories?.some((c) => c.slug === categorySlug)) return true
  return categoryToSlug(post.category ?? '') === categorySlug
}

/**
 * Fetches all blog posts from WordPress GraphQL API.
 * Falls back to mock data on error or missing env (außer bei NEXT_PUBLIC_FORCE_BLOG_API=1).
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const forceApi = process.env.NEXT_PUBLIC_FORCE_BLOG_API === '1'

  try {
    const posts = await fetchAllBlogPostsFromAPI()
    if (posts.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[Blog]', posts.length, 'Einträge von API geladen')
      }
      return posts
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Blog] Fallback auf Mock: API lieferte 0 Einträge. Prüfen: GET /api/blog-debug')
    }
    if (forceApi) return []
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Blog] Fallback auf Mock:', errorMessage)
    }
    if (forceApi) throw err
  }
  return BLOG_POSTS_MOCK
}

/**
 * Returns paginated blog posts (from API with mock fallback).
 */
export async function getPaginatedBlogPosts(
  page: number,
  perPage = 9
): Promise<PaginatedResult<BlogPost>> {
  const posts = await getBlogPosts()
  return paginate(posts, page, perPage)
}

/**
 * Fetches a single blog post by slug (API first, then mock fallback).
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const post = await fetchPostBySlugFromAPI(slug)
    if (post) return post
  } catch {
    // Fallback to mock
  }
  return BLOG_POSTS_MOCK.find((p) => p.slug === slug) ?? null
}

/**
 * Returns the most recent blog posts (for BlogShowcase etc.).
 */
export async function getRecentBlogPosts(limit: number): Promise<BlogPost[]> {
  const posts = await getBlogPosts()
  return posts.slice(0, limit)
}

/**
 * Returns related posts (same category preferred, then by date; excludes current slug).
 */
export async function getRelatedPosts(
  currentSlug: string,
  categorySlug?: string,
  limit = 4
): Promise<BlogPost[]> {
  const posts = await getBlogPosts()
  const rest = posts.filter((p) => p.slug !== currentSlug)
  const byDate = [...rest].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  if (categorySlug) {
    const inCategory = byDate.filter((p) => {
      const cat = p.categories?.find((c) => c.slug === categorySlug)
      if (cat) return true
      return p.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug
    })
    return inCategory.slice(0, limit)
  }
  return byDate.slice(0, limit)
}
