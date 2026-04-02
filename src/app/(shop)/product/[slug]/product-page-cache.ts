import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getProductPageData } from './product-data'
import { fetchGoogleReviews } from '@/lib/google-reviews'
import { getRecentBlogPosts } from '@/features/blog'

/**
 * Produktdaten werden nur innerhalb desselben Requests dedupliziert.
 * So kommen WordPress-Aenderungen sofort im Frontend an.
 */
export const getCachedProductPageData = cache(async (slug: string) => getProductPageData(slug))

export const getCachedRecentBlogPosts = unstable_cache(
  async () => getRecentBlogPosts(4),
  ['product-page-recent-posts'],
  { revalidate: 3600 },
)

export const getCachedGoogleReviews = unstable_cache(
  async () => fetchGoogleReviews(),
  ['product-page-google-reviews'],
  { revalidate: 3600 },
)
