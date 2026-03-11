import { NextRequest, NextResponse } from 'next/server'

const PRODUCT_META_QUERY = /* GraphQL */ `
  query ProductMetaDebug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      slug
      name
      ... on SimpleProduct {
        metaData {
          key
          value
        }
      }
      ... on VariableProduct {
        metaData {
          key
          value
        }
      }
    }
  }
`

/**
 * GET /api/configurator-meta-debug?slug=anhaengerplane-2
 * Gibt die rohen metaData des Produkts zurück, damit du prüfen kannst,
 * welche Keys dein Customizer-Plugin setzt (z. B. _configurator_colors, planenadler_side_options).
 * So kannst du die CONFIGURATOR_META_KEYS in product-data.ts anpassen, falls nötig.
 */
export async function GET(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? ''
  const slug = request.nextUrl.searchParams.get('slug')?.trim() || 'anhaengerplane-2'

  if (!endpoint) {
    return NextResponse.json(
      { success: false, error: 'NEXT_PUBLIC_GRAPHQL_URL fehlt' },
      { status: 502 },
    )
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: PRODUCT_META_QUERY,
        variables: { slug },
      }),
      signal: AbortSignal.timeout(10000),
    })
    const json = (await res.json()) as {
      data?: { product?: { id?: string; databaseId?: number; slug?: string; name?: string; metaData?: Array<{ key?: string; value?: string }> } }
      errors?: Array<{ message: string }>
    }

    if (json.errors?.length) {
      return NextResponse.json({
        success: false,
        slug,
        endpoint,
        error: json.errors[0]?.message ?? 'GraphQL-Fehler',
        hint: "Falls 'metaData' unbekannt ist: Schema muss metaData an Product anbieten (z. B. WPGraphQL/WooCommerce).",
      })
    }

    const product = json.data?.product
    const metaData = product?.metaData ?? []

    const configuratorRelevant = metaData.filter(
      (m) =>
        m?.key &&
        /configurator|planenadler|customizer|pa_|_configurator|side_options|door_extras|extras|steps_enabled|colors/i.test(m.key),
    )

    return NextResponse.json({
      success: true,
      slug,
      productName: product?.name ?? null,
      metaDataCount: metaData.length,
      metaDataKeys: metaData.map((m) => m?.key).filter(Boolean),
      configuratorRelevantKeys: configuratorRelevant.map((m) => m?.key),
      metaData,
      configuratorRelevant: configuratorRelevant.map((m) => ({ key: m?.key, valueLength: (m?.value ?? '').length, valuePreview: (m?.value ?? '').slice(0, 200) })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { success: false, slug, error: message },
      { status: 502 },
    )
  }
}
