import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import { isRequestHttps } from '@/lib/request-is-https'
import {
  appendExpiredAuthCookies,
  createCookieHeaderFromRequest,
  extractLogoutUrl,
  resolveWordPressAccountUrl,
  resolveWordPressOrigin,
  validateSameOrigin,
} from '../_lib'

async function performWordPressLogout(wpCookieHeader: string) {
  if (!wpCookieHeader) return

  let accountUrl: string
  let wpOrigin: string
  try {
    accountUrl = resolveWordPressAccountUrl()
    wpOrigin = resolveWordPressOrigin()
  } catch {
    return
  }

  try {
    const accountRes = await fetch(accountUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        cookie: wpCookieHeader,
      },
    })
    const accountHtml = await accountRes.text()
    const logoutUrl = extractLogoutUrl(accountHtml, wpOrigin)

    await fetch(logoutUrl, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      headers: {
        cookie: wpCookieHeader,
      },
    })
  } catch {
    // Best effort: lokale Cookies werden trotzdem gelöscht.
  }
}

export async function POST(request: NextRequest) {
  const sameOriginError = validateSameOrigin(request)
  if (sameOriginError) {
    return NextResponse.json({ error: sameOriginError }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`wp-logout:${ip}`, { windowMs: 60_000, max: 40 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte kurz warten.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } },
    )
  }

  const wpCookieHeader = createCookieHeaderFromRequest(request)
  await performWordPressLogout(wpCookieHeader)

  const response = NextResponse.json({ success: true, status: 'SUCCESS' })
  appendExpiredAuthCookies(response, request, isRequestHttps(request))
  return response
}
