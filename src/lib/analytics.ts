const GA_MEASUREMENT_ID_FALLBACK = 'G-WFQGYYGWTR'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function getGaMeasurementId(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  if (fromEnv === '') return null
  const raw = fromEnv || GA_MEASUREMENT_ID_FALLBACK
  return /^G-[A-Z0-9]+$/i.test(raw) ? raw : null
}

/** GA4 Virtual Pageview bei Client-Navigation (gtag config). */
export function pageview(url: string): void {
  if (typeof window === 'undefined' || !window.gtag) return
  const id = getGaMeasurementId()
  if (!id) return
  window.gtag('config', id, { page_path: url })
}
