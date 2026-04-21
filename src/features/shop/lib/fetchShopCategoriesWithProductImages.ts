import { SHOP_CATEGORIES } from '../data/shopCategories'
import type { ShopCategory } from '../types'
import { gqlFetch } from '@/features/home/sections/ProductsShowcase/api/fetcher'

const DEFAULT_GRAPHQL_ENDPOINT = 'https://wp.planenadler.de/graphql'

const SHOP_CATEGORY_IMAGES_QUERY = /* GraphQL */ `
  query ShopCategoryImages {
    products(first: 100, where: { status: "publish" }) {
      nodes {
        slug
        name
        ... on Product {
          modified
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              slug
              name
            }
          }
        }
        ... on SimpleProduct {
          modified
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              slug
              name
            }
          }
        }
        ... on VariableProduct {
          modified
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              slug
              name
            }
          }
        }
        ... on ExternalProduct {
          modified
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              slug
              name
            }
          }
        }
        ... on GroupProduct {
          modified
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              slug
              name
            }
          }
        }
      }
    }
  }
`

interface ShopImageNode {
  slug?: string | null
  name?: string | null
  modified?: string | null
  image?: {
    sourceUrl?: string | null
    altText?: string | null
  } | null
  productCategories?: {
    nodes?: Array<{
      slug?: string | null
      name?: string | null
    }> | null
  } | null
}

interface ShopCategoryImagesResponse {
  products?: {
    nodes?: ShopImageNode[] | null
  } | null
}

function getGraphqlEndpoints(): string[] {
  const configured =
    process.env.GRAPHQL_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()

  return Array.from(new Set([configured, DEFAULT_GRAPHQL_ENDPOINT].filter(Boolean))) as string[]
}

function appendImageVersion(sourceUrl: string, version?: string | null): string {
  if (!version) return sourceUrl

  const safeVersion = version.replace(/[^a-zA-Z0-9]/g, '')

  try {
    const url = new URL(sourceUrl)
    url.searchParams.set('v', safeVersion)
    return url.toString()
  } catch {
    // If it's a relative URL, adding ?v= breaks Next.js Image Optimization
    return sourceUrl
  }
}

function getHrefSlug(href: string): string {
  return href.split('/').filter(Boolean).pop()?.toLowerCase() ?? ''
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function buildTokenVariants(value: string): string[] {
  const base = normalizeToken(value)
  const variants = new Set<string>()

  if (!base) {
    return []
  }

  variants.add(base)

  if (base.endsWith('en')) {
    variants.add(base.slice(0, -2))
    variants.add(`${base.slice(0, -2)}e`)
  }

  if (base.endsWith('n')) {
    variants.add(base.slice(0, -1))
  }

  if (base.endsWith('s')) {
    variants.add(base.slice(0, -1))
  }

  return Array.from(variants).filter(Boolean)
}

function getCategoryMatchTokens(category: ShopCategory): string[] {
  const values = [category.id, category.slug, category.name, getHrefSlug(category.href)]
  return Array.from(new Set(values.flatMap(buildTokenVariants)))
}

function getProductMatchTokens(product: ShopImageNode): string[] {
  const categoryValues = (product.productCategories?.nodes ?? []).flatMap((entry) => [
    entry.slug ?? '',
    entry.name ?? '',
  ])
  const values = [product.slug ?? '', product.name ?? '', ...categoryValues]
  return Array.from(new Set(values.flatMap(buildTokenVariants)))
}

function scoreProductMatch(category: ShopCategory, product: ShopImageNode): number {
  const hrefSlug = normalizeToken(getHrefSlug(category.href))
  const categorySlug = normalizeToken(category.slug)
  const categoryName = normalizeToken(category.name)
  const productSlug = normalizeToken(product.slug ?? '')
  const productName = normalizeToken(product.name ?? '')
  const productCategoryTokens = (product.productCategories?.nodes ?? []).flatMap((entry) =>
    [entry.slug ?? '', entry.name ?? ''].map(normalizeToken).filter(Boolean),
  )
  const categoryTokens = getCategoryMatchTokens(category)
  const productTokens = getProductMatchTokens(product)

  if (hrefSlug && productSlug === hrefSlug) {
    return 100
  }

  if (categorySlug && productSlug === categorySlug) {
    return 95
  }

  if (categoryName && productName === categoryName) {
    return 90
  }

  if (hrefSlug && productCategoryTokens.includes(hrefSlug)) {
    return 80
  }

  if (categorySlug && productCategoryTokens.includes(categorySlug)) {
    return 75
  }

  if (categoryName && productCategoryTokens.includes(categoryName)) {
    return 70
  }

  if (categoryTokens.some((token) => productTokens.includes(token))) {
    return 50
  }

  return 0
}

function findMatchingProduct(category: ShopCategory, products: ShopImageNode[]): ShopImageNode | undefined {
  let bestMatch: ShopImageNode | undefined
  let bestScore = 0

  for (const product of products) {
    const score = scoreProductMatch(category, product)
    if (score > bestScore) {
      bestMatch = product
      bestScore = score
    }
  }

  return bestScore > 0 ? bestMatch : undefined
}

export async function fetchShopCategoriesWithProductImages(): Promise<ShopCategory[]> {
  let products: ShopImageNode[] = []
  let lastError: unknown = null

  for (const endpoint of getGraphqlEndpoints()) {
    try {
      const data = await gqlFetch<ShopCategoryImagesResponse>(endpoint, {
        query: SHOP_CATEGORY_IMAGES_QUERY,
        timeoutMs: 12000,
      })
      products = data.products?.nodes ?? []
      lastError = null
      break
    } catch (error) {
      lastError = error
    }
  }

  if (!products.length && lastError) {
    return SHOP_CATEGORIES
  }

  return SHOP_CATEGORIES.map((category) => {
    const product = findMatchingProduct(category, products)
    const sourceUrl = product?.image?.sourceUrl

    if (!sourceUrl) {
      return category
    }

    return {
      ...category,
      image: {
        src: appendImageVersion(sourceUrl, product?.modified),
        alt: product?.image?.altText || product?.name || category.name,
      },
    }
  })
}
