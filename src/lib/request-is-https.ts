import type { NextRequest } from 'next/server'

/**
 * Erkennt TLS korrekt hinter Reverse-Proxies (z. B. Vercel, nginx mit x-forwarded-proto).
 * Wichtig für Secure- und SameSite-Cookies.
 */
export function isRequestHttps(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase()
  if (forwarded === 'https') return true
  if (forwarded === 'http') return false
  return request.nextUrl.protocol === 'https:'
}
