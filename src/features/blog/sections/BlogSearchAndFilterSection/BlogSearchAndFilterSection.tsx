'use client'

import { useMemo, useState, useCallback } from 'react'
import type { BlogPost } from '../../types'
import type { BlogCategoryFilter } from '../../blog.service'
import { postMatchesCategorySlug } from '../../blog.service'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { BlogCard } from '../../components/BlogCard/BlogCard'

interface BlogSearchAndFilterSectionProps {
  posts: BlogPost[]
  categories: BlogCategoryFilter[]
}

function filterBySearch(posts: BlogPost[], query: string): BlogPost[] {
  if (!query.trim()) return posts
  const q = query.trim().toLowerCase()
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt?.toLowerCase().includes(q) ?? false)
  )
}

function filterByCategory(
  posts: BlogPost[],
  categorySlug: string | null
): BlogPost[] {
  if (!categorySlug) return posts
  return posts.filter((p) => postMatchesCategorySlug(p, categorySlug))
}

export function BlogSearchAndFilterSection({
  posts,
  categories,
}: BlogSearchAndFilterSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    const bySearch = filterBySearch(posts, searchQuery)
    return filterByCategory(bySearch, activeCategorySlug)
  }, [posts, searchQuery, activeCategorySlug])

  const handleCategoryClick = useCallback((slug: string | null) => {
    setActiveCategorySlug(slug)
  }, [])

  return (
    <section className="w-full bg-white py-12 lg:py-16" aria-label="Blog mit Suche und Filtern">
      <ContentShell>
        {/* Suchleiste */}
        <div className="mb-6 sm:mb-8">
          <label htmlFor="blog-search" className="sr-only">
            Blog durchsuchen
          </label>
          <input
            id="blog-search"
            type="search"
            placeholder="Beiträge durchsuchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#DBE9F9] bg-[#F7FAFF] px-4 py-3 text-[#1F5CAB] placeholder:text-[#1F5CAB]/50 focus:border-[#1F5CAB] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB]/20 sm:max-w-md sm:py-3.5"
            aria-describedby="blog-search-desc"
          />
          <p id="blog-search-desc" className="sr-only">
            Durchsucht Titel und Kurzbeschreibung der Beiträge.
          </p>
        </div>

        {/* Kategorie-Badges */}
        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Kategorie-Filter">
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            aria-pressed={activeCategorySlug === null}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2 ${
              activeCategorySlug === null
                ? 'bg-[#1F5CAB] text-white shadow-[0_2px_8px_rgba(31,92,171,0.35)]'
                : 'bg-[#DBE9F9] text-[#1F5CAB] hover:bg-[#B9D4F3]'
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => {
            const isActive = activeCategorySlug === cat.slug
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                aria-pressed={isActive}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2 ${
                  isActive
                    ? 'bg-[#1F5CAB] text-white shadow-[0_2px_8px_rgba(31,92,171,0.35)]'
                    : 'bg-[#DBE9F9] text-[#1F5CAB] hover:bg-[#B9D4F3]'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {filteredPosts.length === 0 ? (
          <p className="py-12 text-center text-[#1F5CAB]/80">
            Keine Beiträge gefunden.
            {searchQuery || activeCategorySlug
              ? ' Andere Suchbegriffe oder Kategorie wählen.'
              : ''}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </ContentShell>
    </section>
  )
}
