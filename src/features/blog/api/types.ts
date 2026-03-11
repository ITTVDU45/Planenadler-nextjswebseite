/**
 * Raw types for WPGraphQL posts response (WordPress).
 */

export interface WPGraphQLPostNode {
  id: string
  databaseId?: number
  slug: string
  title?: string | null
  excerpt?: string | null
  date?: string | null
  featuredImage?: {
    node?: {
      sourceUrl?: string | null
      altText?: string | null
    } | null
  } | null
  categories?: {
    nodes?: Array<{ name?: string | null; slug?: string | null }> | null
  } | null
  tags?: {
    nodes?: Array<{ name?: string | null; slug?: string | null }> | null
  } | null
  author?: {
    node?: { name?: string | null } | null
  } | null
  content?: string | null
}

export interface WPGraphQLPostsResponse {
  posts?: {
    nodes?: WPGraphQLPostNode[] | null
    pageInfo?: {
      hasNextPage?: boolean
      endCursor?: string | null
      hasPreviousPage?: boolean
      startCursor?: string | null
    } | null
  } | null
}

export interface WPGraphQLPostResponse {
  post?: WPGraphQLPostNode | null
}
