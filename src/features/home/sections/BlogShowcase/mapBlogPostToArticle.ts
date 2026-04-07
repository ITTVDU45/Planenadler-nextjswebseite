import type { BlogPost } from '@/features/blog/types'
import type { Article, ArticleCategory } from './types'

const BLOG_AUTHOR_NAME = 'Adler Planen'
const BLOG_AUTHOR_AVATAR_SRC = '/images/Planenadler%20bild%20von%20Mitarbeiter.png'

export interface WordPressBlogPost {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  categories: number[]
  featured_media_url?: string
  _embedded?: {
    author?: Array<{ name: string; avatar_urls?: Record<string, string> }>
    'wp:term'?: Array<Array<{ id: number; slug: string; name: string }>>
  }
}

type BlogShowcaseSourcePost = WordPressBlogPost | BlogPost

function stripHtml(value: unknown): string {
  if (typeof value === 'string') return value.replace(/<[^>]+>/g, '').trim()
  if (value && typeof value === 'object' && 'rendered' in value)
    return String((value as { rendered: string }).rendered ?? '').replace(/<[^>]+>/g, '').trim()
  return ''
}

function isWordPressBlogPost(post: BlogShowcaseSourcePost): post is WordPressBlogPost {
  return typeof post.title !== 'string'
}

function getPostCategory(post: BlogShowcaseSourcePost): string {
  if (isWordPressBlogPost(post)) {
    return post._embedded?.['wp:term']?.[0]?.[0]?.slug ?? 'allgemein'
  }

  return post.category ?? post.categories?.[0]?.slug ?? 'allgemein'
}

function getPostCategoryLabel(post: BlogShowcaseSourcePost): string | null {
  if (isWordPressBlogPost(post)) {
    return post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null
  }

  return post.categories?.[0]?.name ?? (post.category ? post.category.replace(/-/g, ' ') : null)
}

function formatDate(date: string): string {
  if (!date) return ''

  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function mapBlogPostToArticle(post: BlogShowcaseSourcePost): Article {
  const title = stripHtml(post.title)
  const excerpt = stripHtml(post.excerpt)
  const publishedAt = isWordPressBlogPost(post) ? post.date : post.publishedAt

  return {
    id: String(post.id),
    title: title || 'Ohne Titel',
    excerpt: excerpt || '',
    category: getPostCategory(post),
    date: formatDate(publishedAt),
    readTime: isWordPressBlogPost(post)
      ? '5 Min. Lesezeit'
      : `${post.readingTimeMin ?? 5} Min. Lesezeit`,
    slug: post.slug,
    image: {
      src: isWordPressBlogPost(post)
        ? post.featured_media_url ?? 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
        : post.coverImage.src,
      alt: title || 'Blog-Artikel',
    },
    author: {
      name: BLOG_AUTHOR_NAME,
      avatar: {
        src: BLOG_AUTHOR_AVATAR_SRC,
        alt: BLOG_AUTHOR_NAME,
      },
    },
  }
}

export function getCategoriesFromBlogPosts(posts: BlogShowcaseSourcePost[]): ArticleCategory[] {
  const seen = new Set<string>()
  const categories: ArticleCategory[] = [{ slug: 'all', label: 'Alle' }]

  for (const post of posts) {
    const slug = getPostCategory(post)
    const label = getPostCategoryLabel(post)

    if (slug && label && !seen.has(slug)) {
      seen.add(slug)
      categories.push({ slug, label })
    }
  }

  return categories
}
