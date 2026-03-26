/**
 * Server-only: Google Places API (New) – Bewertungen abrufen.
 * Nutzt GOOGLE_PLACES_API_KEY (server-side, nicht NEXT_PUBLIC_).
 * Ergebnis wird per Next.js `fetch` mit `revalidate` gecached (1h).
 */

export interface GoogleReviewItem {
  authorName: string
  authorPhotoUrl: string
  authorUrl: string
  rating: number
  text: string
  relativeTime: string
  publishTime: string
  reviewUrl: string
}

export interface GoogleReviewData {
  rating: number
  totalReviews: number
  placeUrl: string
  reviews: GoogleReviewItem[]
}

const FALLBACK: GoogleReviewData = {
  rating: 0,
  totalReviews: 0,
  placeUrl: '',
  reviews: [],
}

const GOOGLE_REVIEWS_TIMEOUT_MS = 8000

interface PlacesApiReview {
  name?: string
  rating?: number
  text?: { text?: string; languageCode?: string }
  originalText?: { text?: string; languageCode?: string }
  authorAttribution?: {
    displayName?: string
    uri?: string
    photoUri?: string
  }
  relativePublishTimeDescription?: string
  publishTime?: string
  googleMapsUri?: string
}

interface PlacesApiResponse {
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: PlacesApiReview[]
}

function pickReviewText(review: PlacesApiReview): string {
  const original = review.originalText?.text
  if (original && review.originalText?.languageCode?.startsWith('de')) {
    return original
  }
  return original || review.text?.text || ''
}

export async function fetchGoogleReviews(): Promise<GoogleReviewData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    console.warn('[GoogleReviews] GOOGLE_PLACES_API_KEY oder GOOGLE_PLACE_ID fehlt')
    return FALLBACK
  }

  try {
    const fields = 'rating,userRatingCount,reviews,googleMapsUri'
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${apiKey}&languageCode=de`

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': fields,
      },
      signal: AbortSignal.timeout(GOOGLE_REVIEWS_TIMEOUT_MS),
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[GoogleReviews] API Fehler ${res.status}: ${text.slice(0, 300)}`)
      return FALLBACK
    }

    const data = (await res.json()) as PlacesApiResponse

    const reviews: GoogleReviewItem[] = (data.reviews ?? [])
      .filter((r) => (r.rating ?? 0) >= 5)
      .sort((a, b) => {
        const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0
        const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0
        return timeB - timeA
      })
      .map((r) => ({
        authorName: r.authorAttribution?.displayName ?? 'Anonym',
        authorPhotoUrl: r.authorAttribution?.photoUri ?? '',
        authorUrl: r.authorAttribution?.uri ?? '',
        rating: r.rating ?? 5,
        text: pickReviewText(r),
        relativeTime: r.relativePublishTimeDescription ?? '',
        publishTime: r.publishTime ?? '',
        reviewUrl: r.googleMapsUri ?? '',
      }))

    return {
      rating: data.rating ?? 0,
      totalReviews: data.userRatingCount ?? 0,
      placeUrl: data.googleMapsUri ?? '',
      reviews,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler'
    console.warn(`[GoogleReviews] Fallback aktiv: ${message}`)
    return FALLBACK
  }
}
