import type { ArticleCategory } from './types'

interface CategoryTabsProps {
  categories: ArticleCategory[]
  activeSlug: string
  onChange: (slug: string) => void
}

export function CategoryTabs({ categories, activeSlug, onChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Blog-Kategorien">
      {categories.map((category) => {
        const isActive = category.slug === activeSlug
        return (
          <button
            key={category.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(category.slug)}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm',
              isActive
                ? 'bg-[#1F5CAB] text-white'
                : 'bg-[#DBE9F9] text-[#1F5CAB] hover:bg-[#c8ddf5]',
            ].join(' ')}
          >
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
