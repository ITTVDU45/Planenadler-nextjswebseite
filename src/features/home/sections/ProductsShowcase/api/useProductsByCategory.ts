'use client'

import { useEffect, useState } from 'react'
import { gqlFetch } from './fetcher'
import { GET_PRODUCTS_ALL, GET_PRODUCTS_BY_CATEGORY } from './queries'

interface ProductNode {
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
      value?: string | null
    }> | null
  } | null
}

interface ProductsResult {
  products: {
    nodes: ProductNode[]
  }
}

export function useProductsByCategory(activeSlug: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductNode[]>([])

  useEffect(() => {
    let cancelled = false
    async function run() {
      const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL
      if (!endpoint) {
        setError('NEXT_PUBLIC_GRAPHQL_URL ist nicht gesetzt')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const isAll = activeSlug === 'all'
        const data = await gqlFetch<ProductsResult>(endpoint, {
          query: isAll ? GET_PRODUCTS_ALL : GET_PRODUCTS_BY_CATEGORY,
          variables: isAll ? undefined : { slug: [activeSlug] },
        })
        if (!cancelled) setProducts(data.products?.nodes ?? [])
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
        // Schema hat kein "products" (z. B. nur WPGraphQL, kein WPGraphQL for WooCommerce) → keine Fehlermeldung, leere Liste
        const isProductsNotInSchema =
          /Cannot query field\s+["']?products["']?/i.test(message) ||
          /Did you mean\s+["']?posts["']?/i.test(message)
        if (isProductsNotInSchema) {
          setProducts([])
          setError(null)
        } else {
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [activeSlug])

  return { loading, error, products }
}
