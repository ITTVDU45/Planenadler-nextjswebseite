import Link from 'next/link'
import type { ProductRecommendation } from './types'

interface ProductRecommendationCardProps {
  product: ProductRecommendation
}

export function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  return (
    <article className="rounded-lg border border-[#DBE9F9] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#1F5CAB]">{product.name}</h3>
      <p className="mt-1 text-sm text-[#1F5CAB]/80">{product.price}</p>
      <Link href={`/product/${product.slug}`} className="mt-3 inline-block text-sm font-medium text-[#3982DC] hover:underline">
        Produkt ansehen
      </Link>
    </article>
  )
}
