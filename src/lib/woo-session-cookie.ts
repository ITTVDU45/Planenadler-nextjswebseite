import type { NextRequest, NextResponse } from 'next/server'

export const WOO_SESSION_COOKIE = 'planenadler_woo_sess'

const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60

export function normalizeWooSessionToken(raw: string | null | undefined): string | null {
  if (!raw || raw === 'false') return null
  const t = raw.trim()
  if (!t) return null
  if (t.toLowerCase().startsWith('session ')) return t.slice(8).trim() || null
  return t
}

export function buildWooSessionCookieValue(token: string): string {
  return token
}

export function appendWooSessionCookie(response: NextResponse, token: string | null, isHttps: boolean) {
  const secure = isHttps ? '; Secure' : ''
  if (!token) {
    response.headers.append(
      'set-cookie',
      `${WOO_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
    )
    return
  }
  response.headers.append(
    'set-cookie',
    `${WOO_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SEVEN_DAYS_SEC}; HttpOnly; SameSite=Lax${secure}`,
  )
}

export function readWooSessionTokenFromRequest(request: NextRequest): string | null {
  const raw = request.cookies.get(WOO_SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/**
 * Gleiche Session wie GraphQL-Proxy: Cookie + woocommerce-session-Header.
 * Ohne Header kann die Store API einen anderen/leeren Warenkorb sehen als WPGraphQL → falsche payment_methods / „invalid payment method“.
 */
export function buildWooStoreApiHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {}
  const cookie = request.headers.get('cookie')
  if (cookie) headers.cookie = cookie
  const sessionToken = readWooSessionTokenFromRequest(request)
  if (sessionToken) headers['woocommerce-session'] = `Session ${sessionToken}`
  return headers
}
