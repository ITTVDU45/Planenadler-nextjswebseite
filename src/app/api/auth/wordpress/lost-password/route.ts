import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  extractInputValue,
  extractWooErrorMessage,
  resolveWordPressLostPasswordUrl,
  validateSameOrigin,
} from '../_lib'

type LostPasswordRequestBody = {
  username?: string
}

export async function POST(request: NextRequest) {
  const sameOriginError = validateSameOrigin(request)
  if (sameOriginError) {
    return NextResponse.json({ error: sameOriginError }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`wp-lost-pw:${ip}`, { windowMs: 15 * 60_000, max: 8 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zu viele Passwort-Reset-Anfragen. Bitte spaeter erneut versuchen.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } },
    )
  }

  const body = (await request.json().catch(() => ({}))) as LostPasswordRequestBody
  const username = body.username?.trim() ?? ''

  if (!username) {
    return NextResponse.json(
      { error: 'Bitte E-Mail oder Benutzername eingeben.' },
      { status: 400 }
    )
  }

  let lostPasswordUrl: string
  try {
    lostPasswordUrl = resolveWordPressLostPasswordUrl()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'WordPress-Konfiguration fehlt.' },
      { status: 500 }
    )
  }

  const pageResponse = await fetch(lostPasswordUrl, {
    method: 'GET',
    cache: 'no-store',
  })

  const pageHtml = await pageResponse.text()
  const nonce = extractInputValue(pageHtml, 'woocommerce-lost-password-nonce')
  const referer = extractInputValue(pageHtml, '_wp_http_referer') || '/mein-konto/lost-password/'

  if (!nonce) {
    return NextResponse.json(
      { error: 'Passwort-Reset-Nonce konnte nicht gelesen werden.' },
      { status: 502 }
    )
  }

  const formData = new URLSearchParams()
  formData.set('user_login', username)
  formData.set('wc_reset_password', 'true')
  formData.set('woocommerce-lost-password-nonce', nonce)
  formData.set('_wp_http_referer', referer)

  const submitResponse = await fetch(lostPasswordUrl, {
    method: 'POST',
    redirect: 'manual',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  const location = submitResponse.headers.get('location') || ''
  if (submitResponse.status >= 300 && submitResponse.status < 400 && location.includes('reset-link-sent=true')) {
    return NextResponse.json({ success: true, status: 'SUCCESS' })
  }

  const submitHtml = await submitResponse.text().catch(() => '')
  const wpError = extractWooErrorMessage(submitHtml)

  if (wpError) {
    return NextResponse.json({ error: wpError }, { status: 400 })
  }

  return NextResponse.json({ success: true, status: 'SUCCESS' })
}
