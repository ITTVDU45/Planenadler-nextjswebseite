import { NextResponse } from 'next/server'
import { fetchAllBlogPostsFromAPI } from '@/features/blog/api'

/**
 * GET /api/blog-debug – Prüft, ob die Blog-Posts von shop.planenadler.de/graphql geladen werden.
 * Im Browser aufrufen (z. B. http://localhost:3000/api/blog-debug) um Fehler oder geladene Slugs zu sehen.
 */
export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '(nicht gesetzt)'

  try {
    const posts = await fetchAllBlogPostsFromAPI()
    return NextResponse.json({
      success: true,
      source: 'api',
      endpoint,
      count: posts.length,
      slugs: posts.map((p) => p.slug),
      sample: posts.slice(0, 2).map((p) => ({ slug: p.slug, title: p.title, category: p.category })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        success: false,
        source: 'api',
        endpoint,
        error: message,
        hint: 'NEXT_PUBLIC_GRAPHQL_URL prüfen; WPGraphQL auf shop.planenadler.de aktiv?',
      },
      { status: 502 }
    )
  }
}
