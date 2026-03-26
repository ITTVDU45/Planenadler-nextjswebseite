'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductRecommendationCard } from './ProductRecommendationCard'
import type { ProductRecommendation } from './types'

const AUTOPLAY_INTERVAL = 4000
const SCROLL_AMOUNT = 360

interface ProductRecommendationsProps {
  items?: ProductRecommendation[]
}

export default function ProductRecommendations({ items = [] }: ProductRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  useEffect(() => {
    if (isPaused || items.length <= 1) return

    const id = setInterval(() => {
      const el = scrollRef.current
      if (!el) return

      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
      }
    }, AUTOPLAY_INTERVAL)

    return () => clearInterval(id)
  }, [isPaused, items.length])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'right' ? SCROLL_AMOUNT : -SCROLL_AMOUNT, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <section className="w-full bg-[#F7FAFF] py-12 md:py-16" aria-labelledby="recommendations-title">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <h2 id="recommendations-title" className="text-2xl font-bold text-[#0F2B52]">
            Passend dazu
          </h2>

          {items.length > 1 && (
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3F7] bg-white shadow-sm transition hover:bg-[#F4F9FF] disabled:opacity-30"
                aria-label="Vorherige Produkte"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke="#1F5CAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3F7] bg-white shadow-sm transition hover:bg-[#F4F9FF] disabled:opacity-30"
                aria-label="Nächste Produkte"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="#1F5CAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          className="scrollbar-hide mt-8 flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1"
          style={{ scrollSnapType: 'x mandatory' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {items.map((item) => (
            <ProductRecommendationCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
