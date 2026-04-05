import { unstable_cache } from 'next/cache'
import { getProductPageData } from './product-data'
import { fetchGoogleReviews } from '@/lib/google-reviews'
import { getRecentBlogPosts } from '@/features/blog'

export const getCachedProductPageData = unstable_cache(
  async (slug: string) => getProductPageData(slug),
  ['product-page-data'],
  { revalidate: 60 },
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
