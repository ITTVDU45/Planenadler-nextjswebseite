import type {
  TruckTarpProduct,
  ProductImage,
  ProductFeature,
  ProductTab,
  ProductRecommendation,
} from './components/types'
import type { CustomizerConfig, CustomizerApiResponse } from '@/lib/customizer-types'
import { resolveCustomizerState } from '@/lib/customizer-resolver'
import type { ConfiguratorState } from '@/lib/customizer-runtime'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? ''
const CUSTOMIZER_API_BASE = process.env.CUSTOMIZER_API_URL ?? ''
const CUSTOMIZER_REST_API_KEY = process.env.CUSTOMIZER_REST_API_KEY?.trim() ?? ''

/** Sollte mit PRODUCT_PAGE_REVALIDATE_SECONDS / product-page-cache.ts übereinstimmen */
const DATA_REVALIDATE_SECONDS = Math.max(
  60,
  Number.parseInt(process.env.PRODUCT_PAGE_REVALIDATE_SECONDS ?? '300', 10) || 300,
)

const PLACEHOLDER_IMAGE: ProductImage = {
  src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOWNhM2FmIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5LZWluIEJpbGQ8L3RleHQ+PC9zdmc+',
  alt: 'Kein Bild verfügbar',
}

interface GqlResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function gqlFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!GRAPHQL_URL) throw new Error('NEXT_PUBLIC_GRAPHQL_URL ist nicht konfiguriert')

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: DATA_REVALIDATE_SECONDS },
  })

  if (!res.ok) {
    throw new Error(`GraphQL-Antwort fehlgeschlagen (${res.status})`)
  }

  const json = (await res.json()) as GqlResponse<T>

  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }
  if (!json.data) {
    throw new Error('Leere GraphQL-Antwort')
  }
  return json.data
}

const PRODUCT_BY_SLUG_QUERY = /* GraphQL */ `
  query ProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      modified
      description
      shortDescription
      onSale
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
      }
      ... on VariableProduct {
        price
        regularPrice
        salePrice
      }
      productCategories {
        nodes {
          name
          slug
        }
      }
      related(first: 12) {
        nodes {
          id
          databaseId
          name
          slug
          modified
          image {
            sourceUrl
            altText
          }
          ... on SimpleProduct {
            price
          }
          ... on VariableProduct {
            price
          }
        }
      }
    }
    products(first: 50, where: { status: "publish" }) {
      nodes {
        id
        databaseId
        name
        slug
        modified
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
        }
        ... on VariableProduct {
          price
        }
      }
    }
  }
`

interface WpImage {
  sourceUrl?: string | null
  altText?: string | null
}

function appendImageVersion(sourceUrl: string | null | undefined, version: string | null | undefined): string | null {
  if (!sourceUrl) return null
  if (!version) return sourceUrl

  try {
    const url = new URL(sourceUrl)
    url.searchParams.set('v', version)
    return url.toString()
  } catch {
    const separator = sourceUrl.includes('?') ? '&' : '?'
    return `${sourceUrl}${separator}v=${encodeURIComponent(version)}`
  }
}

interface WpProductNode {
  id: string
  databaseId: number
  name: string
  slug: string
  modified?: string | null
  description?: string | null
  shortDescription?: string | null
  onSale?: boolean
  price?: string | null
  regularPrice?: string | null
  salePrice?: string | null
  image?: WpImage | null
  galleryImages?: { nodes?: WpImage[] | null } | null
  productCategories?: { nodes?: Array<{ name?: string; slug?: string }> | null } | null
  related?: { nodes?: WpRelatedNode[] | null } | null
}

interface WpRelatedNode {
  id: string
  databaseId: number
  name: string
  slug: string
  modified?: string | null
  price?: string | null
  image?: WpImage | null
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&euro;': '€',
  '&#8364;': '€',
}

function decodePrice(raw: string | null | undefined): string {
  if (!raw) return 'Preis auf Anfrage'
  let decoded = raw
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    decoded = decoded.split(entity).join(char)
  }
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  return decoded.trim()
}

function toProductImage(
  img: WpImage | null | undefined,
  fallbackAlt: string,
  version?: string | null,
): ProductImage {
  const versionedSrc = appendImageVersion(img?.sourceUrl, version)
  if (!versionedSrc) return { ...PLACEHOLDER_IMAGE, alt: fallbackAlt }
  return { src: versionedSrc, alt: img?.altText || fallbackAlt }
}

function buildFeatures(product: WpProductNode): ProductFeature[] {
  const features: ProductFeature[] = []

  features.push({
    title: 'Hochwertige Qualität',
    detail: 'Aus robustem PVC-Material gefertigt – reißfest, UV-beständig und langlebig.',
  })
  features.push({
    title: 'Maßanfertigung',
    detail: 'Jede Plane wird individuell nach Ihren Maßen und Anforderungen gefertigt.',
  })
  features.push({
    title: 'Witterungsbeständig',
    detail: 'Optimaler Schutz bei Regen, Wind, Schnee und direkter Sonneneinstrahlung.',
  })
  features.push({
    title: 'Made in Germany',
    detail: 'Produziert und verschweißt in Deutschland mit höchsten Qualitätsstandards.',
  })

  return features
}

function buildTabs(product: WpProductNode): ProductTab[] {
  const tabs: ProductTab[] = []

  const desc = stripHtml(product.description)
  if (desc) {
    tabs.push({
      value: 'beschreibung',
      label: 'Beschreibung',
      content: { intro: desc },
    })
  } else {
    tabs.push({
      value: 'beschreibung',
      label: 'Beschreibung',
      content: { intro: `${product.name} – individuell konfigurierbar und in höchster Qualität gefertigt.` },
    })
  }

  tabs.push({
    value: 'technische-daten',
    label: 'Technische Daten',
    content: {
      intro: 'Technische Spezifikationen für dieses Produkt.',
      specs: [
        { label: 'Material', value: 'PVC-beschichtetes Polyestergewebe' },
        { label: 'Materialstärke', value: '650 g/m²' },
        { label: 'UV-Beständigkeit', value: 'Ja – UV-stabilisiert' },
        { label: 'Temperaturbereich', value: '-30 °C bis +70 °C' },
        { label: 'Schweißverfahren', value: 'Hochfrequenz-Verschweißung' },
      ],
    },
  })

  tabs.push({
    value: 'versand',
    label: 'Versand & Lieferung',
    content: {
      intro: 'Informationen zu Versand und Lieferzeiten.',
      bullets: [
        'Standardversand innerhalb Deutschlands: 3–5 Werktage',
        'Expressversand möglich (Aufpreis)',
        'EU-weiter Versand verfügbar',
        'Kostenloser Versand ab 500 € Bestellwert',
      ],
    },
  })

  return tabs
}

function buildRecommendations(
  related: WpRelatedNode[],
  allProducts: WpRelatedNode[],
  currentDatabaseId: number,
): ProductRecommendation[] {
  const seen = new Set<number>()
  const result: ProductRecommendation[] = []

  const addNode = (node: WpRelatedNode) => {
    if (node.databaseId === currentDatabaseId) return
    if (seen.has(node.databaseId)) return
    seen.add(node.databaseId)
      result.push({
        id: node.databaseId,
        name: node.name,
        slug: node.slug,
        price: decodePrice(node.price),
        image: node.image?.sourceUrl
          ? {
              src: appendImageVersion(node.image.sourceUrl, node.modified) ?? node.image.sourceUrl,
              alt: node.image.altText || node.name,
            }
          : undefined,
      })
  }

  for (const node of related) addNode(node)
  for (const node of allProducts) addNode(node)

  return result
}

async function fetchCustomizerConfig(productId: number): Promise<{
  rawConfig: CustomizerConfig | null
  state: ConfiguratorState
  resolvedConfig: ReturnType<typeof resolveCustomizerState>['resolvedConfig']
}> {
  if (!CUSTOMIZER_API_BASE) {
    return {
      rawConfig: null,
      resolvedConfig: null,
      state: {
        status: 'error',
        message: 'CUSTOMIZER_API_URL ist nicht konfiguriert.',
      },
    }
  }

  try {
    const url = `${CUSTOMIZER_API_BASE}/${productId}`
    const headers: Record<string, string> = {}
    if (CUSTOMIZER_REST_API_KEY) {
      headers['X-Planenadler-Customizer-Key'] = CUSTOMIZER_REST_API_KEY
    }
    const res = await fetch(url, {
      headers,
      next: { revalidate: DATA_REVALIDATE_SECONDS },
    })
    if (res.status === 404) {
      return {
        rawConfig: null,
        resolvedConfig: null,
        state: {
          status: 'missing',
          message: 'Fuer dieses Produkt wurde im WordPress-Backend keine Konfiguration gefunden.',
        },
      }
    }
    if (!res.ok) {
      return {
        rawConfig: null,
        resolvedConfig: null,
        state: {
          status: 'error',
          message: `Customizer-API antwortete mit Status ${res.status}.`,
        },
      }
    }

    const json = (await res.json()) as CustomizerApiResponse
    const { state, resolvedConfig } = resolveCustomizerState(json)
    return {
      rawConfig: json.success && json.data ? json.data : null,
      resolvedConfig,
      state,
    }
  } catch (error) {
    return {
      rawConfig: null,
      resolvedConfig: null,
      state: {
        status: 'error',
        message:
          error instanceof Error
            ? `Customizer-Daten konnten nicht geladen werden: ${error.message}`
            : 'Customizer-Daten konnten nicht geladen werden.',
      },
    }
  }
}

function mapToTruckTarpProduct(
  product: WpProductNode,
  allProducts: WpRelatedNode[],
  customizerData?: Awaited<ReturnType<typeof fetchCustomizerConfig>>,
): TruckTarpProduct {
  const mainImage = toProductImage(product.image, product.name, product.modified)

  const gallery: ProductImage[] = (product.galleryImages?.nodes ?? [])
    .filter((img): img is WpImage => !!img?.sourceUrl)
    .map((img) => toProductImage(img, product.name, product.modified))

  const subtitle =
    stripHtml(product.shortDescription) ||
    `Hochwertige ${product.name} – individuell nach Maß gefertigt.`

  const relatedNodes = product.related?.nodes ?? []

  return {
    databaseId: product.databaseId,
    title: product.name,
    subtitle,
    price: decodePrice(product.price),
    ctaLabel: 'Jetzt konfigurieren',
    image: mainImage,
    gallery,
    features: buildFeatures(product),
    tabs: buildTabs(product),
    recommendations: buildRecommendations(relatedNodes, allProducts, product.databaseId),
    configuratorHints: customizerData?.resolvedConfig?.hints,
    configuratorOptions: {
      rawCustomizerConfig: customizerData?.rawConfig ?? null,
      resolvedConfig: customizerData?.resolvedConfig ?? null,
      state: customizerData?.state ?? {
        status: 'missing',
        message: 'Fuer dieses Produkt liegt keine Konfiguration vor.',
      },
    },
    priceEndpoint:
      customizerData?.resolvedConfig?.pricingCapabilities.livePrice &&
      customizerData.state.status !== 'unsupported'
        ? '/api/price-calculate'
        : undefined,
  }
}

export async function getProductPageData(slug: string): Promise<TruckTarpProduct> {
  try {
    const data = await gqlFetch<{
      product: WpProductNode | null
      products?: { nodes?: WpRelatedNode[] | null } | null
    }>(
      PRODUCT_BY_SLUG_QUERY,
      { slug },
    )

    if (!data.product) {
      return fallbackProduct(slug, 'Das Produkt wurde in WooCommerce nicht gefunden.')
    }

    const allProducts = data.products?.nodes ?? []

    const customizerData = await fetchCustomizerConfig(data.product.databaseId)

    return mapToTruckTarpProduct(data.product, allProducts, customizerData)
  } catch (error) {
    return fallbackProduct(
      slug,
      error instanceof Error
        ? `Produktdaten konnten nicht live geladen werden: ${error.message}`
        : 'Produktdaten konnten nicht live geladen werden.',
    )
  }
}

function fallbackProduct(slug: string, dataErrorMessage?: string): TruckTarpProduct {
  const name = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    databaseId: 0,
    title: name,
    subtitle: `${name} – individuell konfigurierbar und in höchster Qualität gefertigt.`,
    price: 'Preis auf Anfrage',
    ctaLabel: 'Jetzt konfigurieren',
    image: PLACEHOLDER_IMAGE,
    gallery: [],
    features: buildFeatures({} as WpProductNode),
    tabs: [
      {
        value: 'beschreibung',
        label: 'Beschreibung',
        content: { intro: `${name} – Maßanfertigung aus hochwertigem PVC-Material.` },
      },
    ],
    recommendations: [],
    configuratorOptions: dataErrorMessage
      ? {
          rawCustomizerConfig: null,
          resolvedConfig: null,
          state: {
            status: 'error',
            message: dataErrorMessage,
          },
        }
      : undefined,
  }
}
