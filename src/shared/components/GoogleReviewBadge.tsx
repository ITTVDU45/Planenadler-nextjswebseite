import type { GoogleReviewData } from '@/lib/google-reviews'

interface GoogleReviewBadgeProps {
  reviews: GoogleReviewData
}

function StarIcon({ filled }: { filled: 'full' | 'half' | 'empty' }) {
  const colors: Record<string, { fill: string; stroke: string }> = {
    full: { fill: '#F4B545', stroke: '#F4B545' },
    half: { fill: '#F4B545', stroke: '#F4B545' },
    empty: { fill: '#E0E5EC', stroke: '#E0E5EC' },
  }
  const { fill, stroke } = colors[filled]

  if (filled === 'half') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="#F4B545" />
            <stop offset="50%" stopColor="#E0E5EC" />
          </linearGradient>
        </defs>
        <path
          d="M12 3.5l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17.7 6.5 20.5l1.1-6.2-4.5-4.3 6.2-.9L12 3.5z"
          fill="url(#half-star)"
          stroke="#F4B545"
          strokeWidth="1"
        />
      </svg>
    )
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.5l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 17.7 6.5 20.5l1.1-6.2-4.5-4.3 6.2-.9L12 3.5z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
      />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  const stars: Array<'full' | 'half' | 'empty'> = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full')
    else if (rating >= i - 0.5) stars.push('half')
    else stars.push('empty')
  }

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} von 5 Sternen`}>
      {stars.map((type, idx) => (
        <StarIcon key={idx} filled={type} />
      ))}
    </div>
  )
}

export function GoogleReviewBadge({ reviews }: GoogleReviewBadgeProps) {
  if (reviews.totalReviews === 0) return null

  const Wrapper = reviews.placeUrl ? 'a' : 'div'
  const linkProps = reviews.placeUrl
    ? { href: reviews.placeUrl, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrapper
      {...linkProps}
      className="mt-3 block rounded-lg border border-[#EAF1FB] bg-[#FCFDFF] p-2.5 transition hover:border-[#C5D8F0] hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <p className="text-xs font-semibold text-[#1F5CAB]/85">Google Bewertungen</p>
        </div>
        <span className="text-[11px] text-[#1F5CAB]/55">Verifiziert</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="text-sm font-bold text-[#0F2B52]">{reviews.rating.toFixed(1)}</span>
        <StarRating rating={reviews.rating} />
        <span className="text-[11px] text-[#1F5CAB]/65">
          ({reviews.totalReviews} {reviews.totalReviews === 1 ? 'Rezension' : 'Rezensionen'})
        </span>
      </div>
    </Wrapper>
  )
}
