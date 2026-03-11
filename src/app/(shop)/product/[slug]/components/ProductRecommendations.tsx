import { ProductRecommendationCard } from './ProductRecommendationCard'
import type { ProductRecommendation } from './types'

interface ProductRecommendationsProps {
  items?: ProductRecommendation[]
}

export default function ProductRecommendations({ items = [] }: ProductRecommendationsProps) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12" aria-labelledby="recommendations-title">
      <h2 id="recommendations-title" className="mb-4 text-2xl font-bold text-[#0F2B52]">
        Passend dazu
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ProductRecommendationCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  )
}
