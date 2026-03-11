'use client'

import { useEffect, useMemo, useState } from 'react'
import { BLOG_CATEGORIES, ARTICLES } from './data'
import { CategoryTabs } from './CategoryTabs'
import { SearchBar } from './SearchBar'
import { FeaturedArticleCard } from './FeaturedArticleCard'
import { ArticlesGrid } from './ArticlesGrid'
import { ArticleCard } from './ArticleCard'
import type { Article, ArticleCategory } from './types'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface BlogShowcaseProps {
  /** When provided, these articles are shown instead of static ARTICLES (e.g. from WordPress API). */
  articles?: Article[]
  /** When provided (z. B. aus API-Posts abgeleitet), werden diese als Kategorie-Tabs genutzt. */
  categories?: ArticleCategory[]
}

export function BlogShowcase({ articles: articlesProp, categories: categoriesProp }: BlogShowcaseProps = {}) {
  const [activeSlug, setActiveSlug] = useState('all')
  const [query, setQuery] = useState('')
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0)

  const sourceArticles = articlesProp ?? ARTICLES
  const sourceCategories = categoriesProp ?? BLOG_CATEGORIES

  useEffect(() => {
    const slugs = sourceCategories.map((c) => c.slug)
    if (!slugs.includes(activeSlug)) setActiveSlug('all')
  }, [sourceCategories, activeSlug])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return sourceArticles.filter((article) => {
      const matchesCategory =
        activeSlug === 'all' || article.category === activeSlug
      const matchesQuery =
        !normalizedQuery ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.excerpt.toLowerCase().includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [activeSlug, query, sourceArticles])

  const [featured, ...rest] = filtered
  const gridArticles: Article[] = rest.slice(0, 3)
  const mobileCards: Article[] = filtered.slice(0, 4)
  const mobileSlides = mobileCards.reduce<Article[][]>((groups, article, index) => {
    const groupIndex = Math.floor(index / 2)
    if (!groups[groupIndex]) groups[groupIndex] = []
    groups[groupIndex].push(article)
    return groups
  }, [])
  const mobileSlideCount = mobileSlides.length
  const canSlideMobile = mobileSlideCount > 1

  useEffect(() => {
    if (mobileSlideCount === 0) return
    setMobileSlideIndex((current) => Math.min(current, mobileSlideCount - 1))
  }, [mobileSlideCount])

  useEffect(() => {
    if (!canSlideMobile) return
    const id = window.setInterval(() => {
      setMobileSlideIndex((current) => (current + 1) % mobileSlideCount)
    }, 4500)
    return () => window.clearInterval(id)
  }, [canSlideMobile, mobileSlideCount])

  const goMobilePrev = () => {
    if (!canSlideMobile) return
    setMobileSlideIndex((current) => (current - 1 + mobileSlideCount) % mobileSlideCount)
  }

  const goMobileNext = () => {
    if (!canSlideMobile) return
    setMobileSlideIndex((current) => (current + 1) % mobileSlideCount)
  }

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold text-[#3982DC]">
              Unser Blog
            </div>
            <h2 className="mt-2 text-3xl font-bold text-[#1F5CAB] sm:text-4xl lg:text-5xl">
              Neuigkeiten und Ratgeber!
            </h2>
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryTabs
            categories={sourceCategories}
            activeSlug={activeSlug}
            onChange={setActiveSlug}
          />
        </div>

        <div className="mt-8 sm:hidden">
          {mobileCards.length ? (
            <>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${mobileSlideIndex * 100}%)` }}
                >
                  {mobileSlides.map((slide, slideIndex) => (
                    <div
                      key={`blog-mobile-slide-${slideIndex}`}
                      className="grid w-full shrink-0 grid-cols-2 gap-3 px-1"
                    >
                      {slide.map((article) => (
                        <div key={article.id} className="w-full">
                          <ArticleCard article={article} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={goMobilePrev}
                  aria-label="Vorheriger Blog Slide"
                  disabled={!canSlideMobile}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE9F9] text-[#1F5CAB] transition hover:bg-[#DBE9F9]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M15 5l-7 7 7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="flex items-center justify-center gap-2">
                  {mobileSlides.map((slide, index) => {
                    const isActive = index === mobileSlideIndex
                    return (
                      <button
                        key={`blog-mobile-dot-${index}`}
                        type="button"
                        onClick={() => setMobileSlideIndex(index)}
                        aria-label={`Blog Slide ${index + 1}${slide[0] ? `: ${slide[0].title}` : ''}`}
                        aria-current={isActive ? 'true' : 'false'}
                        className={[
                          'h-2 rounded-full transition-all duration-300',
                          isActive
                            ? 'w-6 bg-[#1F5CAB]'
                            : 'w-2 bg-[#1F5CAB]/35 hover:bg-[#1F5CAB]/60',
                        ].join(' ')}
                      />
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={goMobileNext}
                  aria-label="Nächster Blog Slide"
                  disabled={!canSlideMobile}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE9F9] text-[#1F5CAB] transition hover:bg-[#DBE9F9]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M9 5l7 7-7 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-8 sm:mt-10 hidden sm:block">
          {featured ? <FeaturedArticleCard article={featured} /> : null}
        </div>

        <div className="mt-8 sm:mt-10 hidden sm:block">
          <ArticlesGrid articles={gridArticles} />
        </div>
      </ContentShell>
    </section>
  )
}
