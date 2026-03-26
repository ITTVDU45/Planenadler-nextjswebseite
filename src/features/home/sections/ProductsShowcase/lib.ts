import type { ProductCardItem } from './types'

export interface ProductNode {
  id: string
  slug?: string | null
  name: string
  description?: string | null
  shortDescription?: string | null
  averageRating?: string | null
  price?: string | null
  image?: {
    sourceUrl?: string | null
    altText?: string | null
  } | null
  galleryImages?: {
    nodes?: Array<{
      sourceUrl?: string | null
      altText?: string | null
    }> | null
  } | null
  attributes?: {
    nodes?: Array<{
      name?: string | null
      options?: string[] | null
    }> | null
  } | null
}

const PRIORITY_PRODUCT_MATCHERS = [
  ['terrassenplane', 'terrassenplanen'],
  ['poolplane', 'poolplanen'],
  ['abdeckplane', 'abdeckplanen'],
  ['abdeckhaube', 'abdeckhauben'],
]

export function mapNodeToCard(node: ProductNode): ProductCardItem {
  const image = node.image ?? {}
  const gallery = node.galleryImages?.nodes ?? []
  const attributes = node.attributes?.nodes ?? []

  return {
    id: String(node.id ?? ''),
    slug: node.slug ?? undefined,
    name: String(node.name ?? ''),
    price: String(node.price ?? ''),
    averageRating: node.averageRating ?? undefined,
    description: node.description ?? undefined,
    shortDescription: node.shortDescription ?? undefined,
    image: {
      src: String(image.sourceUrl ?? '/images/Terrassenplane_adlerplanen.png'),
      alt: String(image.altText ?? node.name ?? 'Produkt'),
    },
    gallery: gallery.map((entry) => ({
      src: String(entry.sourceUrl ?? ''),
      alt: String(entry.altText ?? ''),
    })),
    attributes: attributes
      .map((entry) => ({
        name: String(entry.name ?? ''),
        value: Array.isArray(entry.options) ? entry.options.filter(Boolean).join(', ') : '',
      }))
      .filter((entry) => entry.name.length > 0 && entry.value.length > 0),
  }
}

function getPriority(product: ProductCardItem): number {
  const haystack = `${product.slug ?? ''} ${product.name}`.toLowerCase()

  const priorityIndex = PRIORITY_PRODUCT_MATCHERS.findIndex((group) =>
    group.some((matcher) => haystack.includes(matcher)),
  )

  return priorityIndex === -1 ? Number.MAX_SAFE_INTEGER : priorityIndex
}

export function sortProducts(products: ProductCardItem[]): ProductCardItem[] {
  return [...products].sort((left, right) => {
    const priorityDifference = getPriority(left) - getPriority(right)
    if (priorityDifference !== 0) return priorityDifference

    return left.name.localeCompare(right.name, 'de', { sensitivity: 'base' })
  })
}
