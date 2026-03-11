/**
 * URL der WooCommerce-Seite „Zahlungsmethoden“ (Mein Konto).
 * Dort können Kunden Karte, Klarna etc. hinzufügen; die Session (Cookie) wird mitgeführt.
 */

const PAYMENT_METHODS_PATH = '/mein-konto/payment-methods/'

function normalizeBasePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed || trimmed === '/') return ''
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`
}

function detectRuntimeBasePath(): string {
  if (typeof window === 'undefined') return ''

  const marker = '/mein-konto/'
  const pathname = window.location.pathname || ''
  const index = pathname.indexOf(marker)
  if (index <= 0) return ''

  return normalizeBasePath(pathname.slice(0, index))
}

export function getAppBasePath(): string {
  const configured = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH || '')
  if (configured) return configured
  return detectRuntimeBasePath()
}

export function getWcPaymentMethodsUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_WC_PAYMENT_METHODS_URL
  if (envUrl) return envUrl.replace(/\/?$/, '/')
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (graphqlUrl) {
    const origin = new URL(graphqlUrl).origin
    return `${origin}${PAYMENT_METHODS_PATH}`
  }
  return ''
}

/**
 * URL zum Hinzufügen einer bestimmten Zahlungsmethode (falls das Backend Query-Parameter unterstützt).
 * Nur für Klarna/PayPal – Karte wird im Frontend per Stripe erfasst.
 */
export function getWcAddPaymentMethodUrl(gatewayId?: string): string {
  const base = getWcPaymentMethodsUrl()
  if (!base) return ''

  let addUrl: URL
  try {
    const parsed = new URL(base)
    const pathname = parsed.pathname.replace(/\/+$/, '/')

    if (/\/payment-methods\/$/i.test(pathname)) {
      parsed.pathname = pathname.replace(/\/payment-methods\/$/i, '/add-payment-method/')
    } else if (!/\/add-payment-method\/$/i.test(pathname)) {
      parsed.pathname = `${pathname}add-payment-method/`
    }

    addUrl = parsed
  } catch {
    const normalizedBase = base.replace(/\/+$/, '/')
    const normalized =
      /\/payment-methods\/$/i.test(normalizedBase)
        ? normalizedBase.replace(/\/payment-methods\/$/i, '/add-payment-method/')
        : /\/add-payment-method\/$/i.test(normalizedBase)
          ? normalizedBase
          : `${normalizedBase}add-payment-method/`
    if (gatewayId) {
      return `${normalized}?payment_method=${encodeURIComponent(gatewayId)}`
    }
    return normalized
  }

  if (gatewayId) {
    addUrl.searchParams.set('payment_method', gatewayId)
  }
  return addUrl.toString()
}

/** Basis-URL der Next.js-App (für Callback nach Klarna/PayPal). */
export function getAppOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return ''
}

/** Callback-URL nach Klarna/PayPal-Redirect (Erfolg/Abbruch). */
export function getPaymentMethodCallbackUrl(provider: 'klarna' | 'paypal', status: 'success' | 'cancel'): string {
  const origin = getAppOrigin()
  if (!origin) return ''
  const basePath = getAppBasePath()
  const callbackPath = `${basePath}/mein-konto/zahlungsmethoden/callback`.replace(/\/{2,}/g, '/')
  return `${origin}${callbackPath}?provider=${provider}&status=${status}`
}

/**
 * URL zum Starten des Klarna „Zahlungsmethode hinzufügen“-Flows.
 * Wenn NEXT_PUBLIC_KLARNA_ADD_PAYMENT_URL gesetzt ist, wird diese verwendet (mit return_url);
 * sonst Fallback auf WooCommerce add-payment-method für klarna.
 */
export function getKlarnaAddPaymentUrl(returnUrl?: string): string {
  const env = process.env.NEXT_PUBLIC_KLARNA_ADD_PAYMENT_URL
  if (env) {
    const url = new URL(env)
    if (returnUrl) url.searchParams.set('return_url', returnUrl)
    return url.toString()
  }
  return getWcAddPaymentMethodUrl('klarna')
}

/**
 * URL zum Starten des PayPal „Zahlungsmethode hinzufügen“-Flows.
 * Wenn NEXT_PUBLIC_PAYPAL_ADD_PAYMENT_URL gesetzt ist, wird diese verwendet (mit return_url);
 * sonst Fallback auf WooCommerce add-payment-method für ppcp-gateway.
 */
export function getPayPalAddPaymentUrl(returnUrl?: string): string {
  const env = process.env.NEXT_PUBLIC_PAYPAL_ADD_PAYMENT_URL
  if (env) {
    const url = new URL(env)
    if (returnUrl) url.searchParams.set('return_url', returnUrl)
    return url.toString()
  }
  return getWcAddPaymentMethodUrl('ppcp-gateway')
}
