import { unstable_cache } from 'next/cache'
import { getProductPageData } from './product-data'
import { fetchGoogleReviews } from '@/lib/google-reviews'
import { getRecentBlogPosts } from '@/features/blog'

const PRODUCT_REVALIDATE = Math.max(
  60,
  Number.parseInt(process.env.PRODUCT_PAGE_REVALIDATE_SECONDS ?? '300', 10) || 300,
)

/**
 * Zwischengespeicherte Produktdaten (GraphQL + Customizer), reduziert TTFB bei wiederholten Aufrufen.
 */
export const getCachedProductPageData = unstable_cache(
  async (slug: string) => getProductPageData(slug),
  ['product-page-data-v2'],
  { revalidate: PRODUCT_REVALIDATE },
)

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
