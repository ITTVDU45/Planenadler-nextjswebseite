'use client'

import { useEffect, useState } from 'react'
import { CategoryCard } from './CategoryCard'
import { POPULAR_CATEGORIES } from './data'
import type { Category } from './types'
import { ContentShell } from '@/shared/components/ContentShell.component'

interface CategoriesStripProps {
  title?: string
  categories?: Category[]
}

export function CategoriesStrip({
  title = 'BELIEBTE KATEGORIEN',
  categories = POPULAR_CATEGORIES,
}: CategoriesStripProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const slides = categories.reduce<Category[][]>((groups, category, index) => {
    const groupIndex = Math.floor(index / 2)
    if (!groups[groupIndex]) groups[groupIndex] = []
    groups[groupIndex].push(category)
    return groups
  }, [])
  const count = slides.length
  const canSlide = count > 1

  useEffect(() => {
    if (count === 0) return
    setActiveIndex((current) => Math.min(current, count - 1))
  }, [count])

  useEffect(() => {
    if (!canSlide) return
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count)
    }, 4500)
    return () => window.clearInterval(id)
  }, [canSlide, count])

  const goPrev = () => {
    if (!canSlide) return
    setActiveIndex((current) => (current - 1 + count) % count)
  }
  const goNext = () => {
    if (!canSlide) return
    setActiveIndex((current) => (current + 1) % count)
  }

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <ContentShell>
        <h2 className="mb-8 text-center text-2xl font-black uppercase tracking-tight text-[#1F5CAB] sm:text-3xl lg:mb-12 lg:text-4xl">
          {title}
        </h2>

        <div className="sm:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => (
                <div
                  key={`category-slide-${slideIndex}`}
                  className="grid w-full shrink-0 grid-cols-2 gap-3 px-1"
                >
                  {slide.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Vorherige Kategorie"
              disabled={!canSlide}
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
              {slides.map((slide, index) => {
                const isActive = index === activeIndex
                return (
                  <button
                    key={`category-dot-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Slide ${index + 1}${slide[0] ? `: ${slide[0].name}` : ''}`}
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
              onClick={goNext}
              aria-label="Nächste Kategorie"
              disabled={!canSlide}
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
        </div>

        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </ContentShell>
    </section>
  )
}
