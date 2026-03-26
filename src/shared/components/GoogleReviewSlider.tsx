'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GoogleReviewData, GoogleReviewItem } from '@/lib/google-reviews'

interface GoogleReviewSliderProps {
  data: GoogleReviewData
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 3.5l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17.7 6.5 20.5l1.1-6.2-4.5-4.3 6.2-.9L12 3.5z"
            fill={i <= rating ? '#F4B545' : '#E0E5EC'}
            stroke={i <= rating ? '#F4B545' : '#E0E5EC'}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: GoogleReviewItem }) {
  const [expanded, setExpanded] = useState(false)
  const needsTruncation = review.text.length > 180
  const displayText = !expanded && needsTruncation
    ? review.text.slice(0, 180) + '…'
    : review.text

  return (
    <article className="flex h-full min-w-[300px] max-w-[360px] shrink-0 snap-start flex-col rounded-2xl border border-[#E2ECF7] bg-white p-5 shadow-[0_8px_24px_rgba(15,43,82,0.06)] transition hover:shadow-[0_12px_32px_rgba(15,43,82,0.1)]">
      <div className="flex items-center gap-3">
        {review.authorPhotoUrl ? (
          <img
            src={review.authorPhotoUrl}
            alt={review.authorName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-bold text-[#1F5CAB]">
            {review.authorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0F2B52]">{review.authorName}</p>
          <p className="text-[11px] text-[#1F5CAB]/55">{review.relativeTime}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>

      <div className="mt-3">
        <StarRow rating={review.rating} />
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#1F5CAB]/80">
        {displayText}
      </p>

      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 self-start text-xs font-semibold text-[#3982DC] hover:underline"
        >
          {expanded ? 'Weniger anzeigen' : 'Mehr lesen'}
        </button>
      )}
    </article>
  )
}

export function GoogleReviewSlider({ data }: GoogleReviewSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 360 + 20
    el.scrollBy({ left: direction === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' })
  }

  if (data.reviews.length === 0 && data.totalReviews === 0) return null

  return (
    <section className="w-full bg-[#F8FBFF] py-16 lg:py-24" aria-labelledby="google-reviews-title">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <h2 id="google-reviews-title" className="text-2xl font-bold text-[#0F2B52] sm:text-3xl">
              Kundenbewertungen
            </h2>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-3xl font-extrabold text-[#0F2B52]">{data.rating.toFixed(1)}</span>
            <div className="flex flex-col items-start">
              <StarRow rating={Math.round(data.rating)} />
              <span className="text-xs text-[#1F5CAB]/60">
                Basierend auf {data.totalReviews} Bewertungen
              </span>
            </div>
          </div>

          {data.placeUrl && (
            <a
              href={data.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs font-medium text-[#3982DC] hover:underline"
            >
              Alle Bewertungen auf Google ansehen
            </a>
          )}
        </div>

        {/* Slider */}
        {data.reviews.length > 0 && (
          <div className="relative mt-10">
            {/* Navigation Buttons */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scroll('left')}
                className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[#D4E3F7] bg-white p-2.5 shadow-lg transition hover:bg-[#F4F9FF] md:flex"
                aria-label="Vorherige Bewertungen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke="#1F5CAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scroll('right')}
                className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[#D4E3F7] bg-white p-2.5 shadow-lg transition hover:bg-[#F4F9FF] md:flex"
                aria-label="Nächste Bewertungen"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="#1F5CAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            <div
              ref={scrollRef}
              className="scrollbar-hide flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {data.reviews.map((review, idx) => (
                <ReviewCard key={`${review.authorName}-${idx}`} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
