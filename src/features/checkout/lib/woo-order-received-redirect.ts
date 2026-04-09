/**
 * WooCommerce leitet nach erfolgreichem Checkout oft auf eine "order-received"-URL
 * (z. B. /kasse/order-received/123/?key=...). Diese URLs sollen in der Headless-App
 * nicht per Voll-Redirect verlassen werden, sondern die interne Dankeseite nutzen.
 */

function resolveCheckoutRedirectUrl(urlString: string): URL | null {
  if (typeof window === 'undefined') return null
  try {
    return new URL(urlString, window.location.href)
  } catch {
    return null
  }
}

export function isWooCommerceOrderReceivedRedirect(urlString: string): boolean {
  const url = resolveCheckoutRedirectUrl(urlString)
  if (!url) return false
  return /order-received/i.test(url.pathname)
}

export function parseWooOrderReceivedUrl(urlString: string): {
  orderId: string | null
  orderKey: string | null
} {
  const url = resolveCheckoutRedirectUrl(urlString)
  if (!url) return { orderId: null, orderKey: null }
  const match = url.pathname.match(/order-received\/(\d+)/i)
  const orderId = match?.[1] ?? null
  const orderKey = url.searchParams.get('key')
  return { orderId, orderKey }
}
