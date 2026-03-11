import Link from 'next/link'
import type { BlogPostCategory, BlogPostTag } from '../../types'

interface TagListProps {
  categories?: BlogPostCategory[] | null
  tags?: BlogPostTag[] | null
  /** Fallback if no categories/tags: use single category name. */
  category?: string | null
}

export function TagList({ categories, tags, category }: TagListProps) {
  const tagItems: { name: string; slug: string; type: 'category' }[] = []
  if (categories?.length) {
    categories.forEach((c) => tagItems.push({ name: c.name, slug: c.slug, type: 'category' }))
  }
  if (tags?.length) {
    tags.forEach((t) => tagItems.push({ name: t.name, slug: t.slug, type: 'category' }))
  }
  if (tagItems.length === 0 && category) {
    const slug = category.toLowerCase().replace(/\s+/g, '-')
    tagItems.push({ name: category, slug, type: 'category' })
  }
  if (tagItems.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1F5CAB]">
        Alle Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tagItems.map((item) => (
          <Link
            key={`${item.slug}-${item.name}`}
            href={`/blog?category=${encodeURIComponent(item.slug)}`}
            className="rounded-full border border-[#DBE9F9] px-3 py-1.5 text-sm text-[#1F5CAB] transition hover:bg-[#1F5CAB] hover:text-white"
          >
            #{item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
