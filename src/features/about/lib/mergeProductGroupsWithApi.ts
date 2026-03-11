import type { ProductGroupCard } from '../types'
import { PRODUCT_GROUPS } from '../data/productGroups'

/** Minimal API-Produkt für Zuordnung zu Produktgruppen (slug + Kategorien). */
export interface ApiProductForMerge {
  slug: string | null
  productCategories?: { nodes?: Array<{ slug?: string | null }> } | null
}

/**
 * Findet für eine Produktgruppen-ID das erste API-Produkt:
 * 1) Kategorie-Slug passt (z. B. terrassenplanen, poolplanen),
 * 2) oder Produkt-Slug passt (z. B. poolplane, hochplane, abdeckhaube).
 */
function findProductForGroup(
  groupId: string,
  apiProducts: ApiProductForMerge[]
): ApiProductForMerge | undefined {
  const groupSlug = groupId.toLowerCase()
  const slugVariant = groupSlug.replace(/en$/, 'e') // poolplanen → poolplane, abdeckplanen → abdeckplane

  return apiProducts.find((p) => {
    const categories = p.productCategories?.nodes ?? []
    const categoryMatch = categories.some(
      (c) =>
        c.slug != null &&
        (c.slug === groupSlug || c.slug === slugVariant)
    )
    const slugMatch =
      p.slug != null &&
      (p.slug === groupSlug || p.slug === slugVariant)
    return categoryMatch || slugMatch
  })
}

/**
 * Reichert die statischen Produktgruppen mit Produktseiten-Links aus der GraphQL-API an.
 * hrefMore und hrefConfig werden aus dem ersten passenden Produkt (nach Kategorie) gesetzt.
 */
export function mergeProductGroupsWithApiProducts(
  apiProducts: ApiProductForMerge[]
): ProductGroupCard[] {
  return PRODUCT_GROUPS.map((group) => {
    const product = findProductForGroup(group.id, apiProducts)
    const slug = product?.slug ?? group.id
    return {
      ...group,
      hrefMore: `/product/${slug}`,
      hrefConfig: `/product/${slug}#konfigurator`,
    }
  })
}
