'use client'

import type { ShopCategory } from '../../types'
import { SHOP_CATEGORIES } from '../../data/shopCategories'
import { CategoryCard } from '../../components/CategoryCard'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface ShopCategoryGridSectionProps {
  categories?: ShopCategory[]
}

export function ShopCategoryGridSection({
  categories = SHOP_CATEGORIES,
}: ShopCategoryGridSectionProps) {
  return (
    <section
      className="w-full bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="shop-categories-heading"
    >
      <ContentShell>
        <h2
          id="shop-categories-heading"
          className="mb-10 text-center text-2xl font-bold text-[#1F5CAB] sm:text-3xl lg:text-4xl"
        >
          Kategorien
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
