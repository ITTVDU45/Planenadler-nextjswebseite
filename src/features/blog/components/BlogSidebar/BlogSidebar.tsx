import Link from 'next/link'
import type { BlogCategoryFilter } from '../../blog.service'
import type { BlogPostTag } from '../../types'
import { ContactCTA } from '../ContactCTA'

interface BlogSidebarProps {
  categories?: BlogCategoryFilter[]
  currentCategorySlug?: string
  tags?: BlogPostTag[]
}

export function BlogSidebar({
  categories = [],
  currentCategorySlug,
  tags = [],
}: BlogSidebarProps) {
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
      {categories.length > 0 && (
        <div className="rounded-[28px] border border-[#DBE9F9] bg-white p-6 shadow-[0_18px_40px_rgba(31,92,171,0.08)]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1F5CAB]">
            Kategorien
          </h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/blog?category=${encodeURIComponent(category.slug)}`}
                  className={`inline-flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    currentCategorySlug === category.slug
                      ? 'bg-[#1F5CAB] text-white'
                      : 'bg-[#F7FAFF] text-[#1F5CAB]/85 hover:bg-[#E9F2FD] hover:text-[#1F5CAB]'
                  }`}
                >
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="rounded-[28px] border border-[#DBE9F9] bg-white p-6 shadow-[0_18px_40px_rgba(31,92,171,0.08)]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#1F5CAB]">
            Schlagwoerter
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog?tag=${tag.slug}`}
                className="rounded-full bg-[#DBE9F9] px-3 py-1 text-xs font-semibold text-[#1F5CAB] transition hover:bg-[#B9D4F3]"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <ContactCTA />
    </aside>
  )
}
