import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  appendWooSessionCookie,
  normalizeWooSessionToken,
  readWooSessionTokenFromRequest,
} from '@/lib/woo-session-cookie'
import { validateSameOrigin } from '@/app/api/auth/wordpress/_lib'
import { isRequestHttps } from '@/lib/request-is-https'
import { fetchWithTransientRetry } from '@/lib/server-fetch-retry'

const MAX_BODY_BYTES = 512 * 1024
const UPSTREAM_TIMEOUT_MS = 30_000

/**
 * Server: GRAPHQL_SERVER_URL (nicht im Client-Bundle) bevorzugen.
 * Öffentliche URL nur Fallback; CORS auf WordPress-Seite auf eure Next-Domain begrenzen.
 */
function resolveGraphqlUrl(): string | null {
  const server = process.env.GRAPHQL_SERVER_URL?.trim()
  if (server) return server
  return process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim() || null
}

export async function POST(request: NextRequest) {
  const originError = validateSameOrigin(request)
  if (originError) {
    return NextResponse.json({ error: originError }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`graphql:${ip}`, { windowMs: 60_000, max: 100 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte kurz warten.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } },
    )
  }

  const url = resolveGraphqlUrl()
  if (!url) {
    return NextResponse.json({ error: 'GraphQL ist nicht konfiguriert.' }, { status: 500 })
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload zu gross.' }, { status: 413 })
  }

  let bodyText: string
  try {
    bodyText = await request.text()
  } catch {
    return NextResponse.json({ error: 'Body konnte nicht gelesen werden.' }, { status: 400 })
  }

  if (bodyText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload zu gross.' }, { status: 413 })
  }

  const sessionToken = readWooSessionTokenFromRequest(request)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (sessionToken) {
    headers['woocommerce-session'] = `Session ${sessionToken}`
  }

  let wpRes: Response
  try {
    wpRes = await fetchWithTransientRetry(
      url,
      {
        method: 'POST',
        headers,
        body: bodyText,
        cache: 'no-store',
      },
      { maxAttempts: 4, timeoutMs: UPSTREAM_TIMEOUT_MS, baseDelayMs: 500 },
    )
  } catch {
    return NextResponse.json({ error: 'GraphQL-Upstream nicht erreichbar.' }, { status: 502 })
  }

  let responseBody: string
  try {
    responseBody = await wpRes.text()
  } catch (readErr) {
    console.error('[api/graphql] upstream body read failed', readErr)
    return NextResponse.json(
      { errors: [{ message: 'GraphQL-Upstream-Antwort konnte nicht gelesen werden.' }] },
      { status: 502 },
    )
  }

  try {
    const nextRes = new NextResponse(responseBody, {
      status: wpRes.status,
      headers: {
        'Content-Type': wpRes.headers.get('content-type') || 'application/json',
      },
    })

    const newSession = normalizeWooSessionToken(wpRes.headers.get('woocommerce-session'))
    const isHttps = isRequestHttps(request)
    if (newSession === null && wpRes.headers.get('woocommerce-session') === 'false') {
      appendWooSessionCookie(nextRes, null, isHttps)
    } else if (newSession) {
      appendWooSessionCookie(nextRes, newSession, isHttps)
    }

    return nextRes
  } catch (buildErr) {
    console.error('[api/graphql] response assembly failed', buildErr)
    return NextResponse.json(
      { errors: [{ message: 'GraphQL-Proxy: Antwort konnte nicht aufbereitet werden.' }] },
      { status: 502 },
    )
  }
}
