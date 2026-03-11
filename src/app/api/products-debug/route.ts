import { NextResponse } from 'next/server'

const PRODUCTS_QUERY = `
  query ProductsTest {
    products(first: 2) {
      nodes {
        id
        name
        slug
      }
    }
  }
`

/**
 * GET /api/products-debug – Prüft, ob die WooCommerce-Produkte im GraphQL-Schema verfügbar sind.
 * Wenn "Cannot query field products" kommt: WPGraphQL for WooCommerce ist inaktiv oder nicht installiert.
 */
export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '(nicht gesetzt)'

  if (!endpoint || endpoint === '(nicht gesetzt)') {
    return NextResponse.json(
      { success: false, error: 'NEXT_PUBLIC_GRAPHQL_URL fehlt', raw: null },
      { status: 502 },
    )
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PRODUCTS_QUERY }),
      signal: AbortSignal.timeout(10000),
    })
    const raw = (await res.json()) as { data?: unknown; errors?: Array<{ message: string }> }
    const errorMessage = raw.errors?.[0]?.message ?? null

    if (raw.errors?.length) {
      return NextResponse.json({
        success: false,
        endpoint,
        error: errorMessage,
        hint: 'Feld "products" fehlt im Schema. WordPress: WPGraphQL for WooCommerce aktivieren und ggf. Plugin-Kompatibilität prüfen.',
        raw,
      })
    }

    const nodes = (raw.data as { products?: { nodes?: unknown[] } })?.products?.nodes ?? []
    return NextResponse.json({
      success: true,
      endpoint,
      count: nodes.length,
      sample: nodes,
      raw: raw.data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { success: false, endpoint, error: message, raw: null },
      { status: 502 },
    )
  }
}
