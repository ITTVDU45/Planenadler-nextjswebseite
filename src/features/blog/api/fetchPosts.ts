import type { BlogPost, BlogPostCategory, BlogPostTag } from '../types'
import type { WPGraphQLPostNode, WPGraphQLPostsResponse, WPGraphQLPostResponse } from './types'
import { blogGraphQLFetch } from './fetcher'
import { POSTS_LIST_QUERY, POST_BY_SLUG_QUERY } from './queries'
import { PLACEHOLDER_IMAGE_DATA_URL } from '@/shared/lib/functions'

const DEFAULT_COVER_ALT = 'Blog-Bild'
const BLOG_AUTHOR_NAME = 'Adler Planen'

function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return ''
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function toCategories(nodes: WPGraphQLPostNode['categories']): BlogPostCategory[] | undefined {
  const list = nodes?.nodes?.filter((n) => n?.name && n?.slug) ?? []
  if (list.length === 0) return undefined
  return list.map((n) => ({ name: n.name!, slug: n.slug! }))
}

function toTags(nodes: WPGraphQLPostNode['tags']): BlogPostTag[] | undefined {
  const list = nodes?.nodes?.filter((n) => n?.name && n?.slug) ?? []
  if (list.length === 0) return undefined
  return list.map((n) => ({ name: n.name!, slug: n.slug! }))
}

export function mapWpPostToBlogPost(node: WPGraphQLPostNode): BlogPost {
  const src =
    node.featuredImage?.node?.sourceUrl ?? PLACEHOLDER_IMAGE_DATA_URL
  const alt =
    node.featuredImage?.node?.altText ?? node.title ?? DEFAULT_COVER_ALT
  const category = node.categories?.nodes?.[0]?.name ?? undefined
  const base: BlogPost = {
    id: String(node.databaseId ?? node.id),
    slug: node.slug,
    title: node.title ?? '',
    excerpt: stripHtml(node.excerpt),
    coverImage: { src, alt },
    publishedAt: node.date ?? '',
    category,
    author: BLOG_AUTHOR_NAME,
  }

  if (node.content != null || (node.categories?.nodes?.length ?? 0) > 0 || (node.tags?.nodes?.length ?? 0) > 0) {
    const categories = toCategories(node.categories)
    const tags = toTags(node.tags)
    return {
      ...base,
      content: node.content ?? undefined,
      categories,
      tags,
    }
  }

  return base
}

const BATCH_SIZE = 50

/**
 * Fetches all published posts from WordPress (paginates through cursor until done).
 */
export async function fetchAllBlogPostsFromAPI(): Promise<BlogPost[]> {
  const results: BlogPost[] = []
  let after: string | null = null

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data: WPGraphQLPostsResponse = await blogGraphQLFetch<WPGraphQLPostsResponse>({
      query: POSTS_LIST_QUERY,
      variables: { first: BATCH_SIZE, after },
    })

    const nodes = data.posts?.nodes ?? []
    for (const node of nodes) {
      results.push(mapWpPostToBlogPost(node))
    }

    const hasNext = data.posts?.pageInfo?.hasNextPage ?? false
    const endCursor: string | null = data.posts?.pageInfo?.endCursor ?? null
    if (!hasNext || !endCursor) break
    after = endCursor
  }

  return results
}

/**
 * Fetches a single post by slug from WordPress.
 */
export async function fetchPostBySlugFromAPI(slug: string): Promise<BlogPost | null> {
  const data = await blogGraphQLFetch<WPGraphQLPostResponse>({
    query: POST_BY_SLUG_QUERY,
    variables: { slug },
  })

  const node = data.post
  if (!node) return null
  return mapWpPostToBlogPost(node)
}
