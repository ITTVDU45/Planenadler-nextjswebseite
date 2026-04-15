/**
 * Google Ads Conversions (z. B. Google Listings & Ads „Kauf“).
 * Benötigt global `gtag` (wird mit GA4-Skripten geladen) + optional `gtag('config', 'AW-…')` im Root.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const AW_ID_PATTERN = /^AW-\d+$/i
const SEND_TO_PATTERN = /^AW-\d+\/.+$/i

/**
 * Vollständiges send_to, z. B. AW-16588332833/VJleCMXiisQZEKG-9-U9
 */
export function getGoogleAdsPurchaseSendTo(): string | null {
  const combined = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO?.trim()
  if (combined && SEND_TO_PATTERN.test(combined)) return combined

  const awIdRaw = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim()
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL?.trim()
  let awId = awIdRaw
  if (awId && !awId.toUpperCase().startsWith('AW-')) {
    const numeric = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim()
    if (numeric && /^\d+$/.test(numeric)) awId = `AW-${numeric}`
    else if (/^\d+$/.test(awId)) awId = `AW-${awId}`
  }
  if (awId && label && AW_ID_PATTERN.test(awId)) {
    return `${awId}/${label}`
  }

  const numericOnly = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim()
  if (numericOnly && /^\d+$/.test(numericOnly) && label) {
    return `AW-${numericOnly}/${label}`
  }

  return null
}

/** Nur die AW-Konto-ID für gtag('config', …). */
export function getGoogleAdsAwId(): string | null {
  const sendTo = getGoogleAdsPurchaseSendTo()
  if (!sendTo) return null
  const prefix = sendTo.split('/')[0]
  return AW_ID_PATTERN.test(prefix) ? prefix : null
}

const GTAG_WAIT_MS = 8000
const GTAG_POLL_MS = 50

function whenGtagReady(run: () => void): void {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    run()
    return
  }
  const started = Date.now()
  const id = window.setInterval(() => {
    if (window.gtag) {
      window.clearInterval(id)
      run()
      return
    }
    if (Date.now() - started > GTAG_WAIT_MS) window.clearInterval(id)
  }, GTAG_POLL_MS)
}

export interface GoogleAdsPurchaseConversionParams {
  value?: number
  currency?: string
  transactionId: string
}

/**
 * Sendet die Ads-Conversion „purchase“ / Kauf-Ziel.
 */
export function fireGoogleAdsPurchaseConversionWhenReady(params: GoogleAdsPurchaseConversionParams): void {
  const sendTo = getGoogleAdsPurchaseSendTo()
  if (!sendTo || typeof window === 'undefined') return

  whenGtagReady(() => {
    if (!window.gtag) return
    const payload: Record<string, string | number> = {
      send_to: sendTo,
      transaction_id: String(params.transactionId),
    }
    if (params.currency) payload.currency = params.currency
    if (params.value != null && Number.isFinite(params.value) && params.value >= 0) {
      payload.value = Math.round(params.value * 100) / 100
    }
    window.gtag('event', 'conversion', payload)
  })
}
