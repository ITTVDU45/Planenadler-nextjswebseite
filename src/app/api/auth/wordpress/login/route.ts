import { NextRequest, NextResponse } from 'next/server'
import { checkCustomerSession } from '@/features/auth/api/fetchCustomerAccount'
import { getClientIp } from '@/lib/client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import { isRequestHttps } from '@/lib/request-is-https'
import {
  appendAuthCookiesToResponse,
  createCookieHeaderForWpRequest,
  extractInputValue,
  extractWooErrorMessage,
  getSetCookieHeaders,
  resolveWordPressAccountUrl,
  validateSameOrigin,
} from '../_lib'

type LoginRequestBody = {
  username?: string
  password?: string
  remember?: boolean
}

export async function POST(request: NextRequest) {
  const sameOriginError = validateSameOrigin(request)
  if (sameOriginError) {
    return NextResponse.json({ error: sameOriginError }, { status: 403 })
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`wp-login:${ip}`, { windowMs: 15 * 60_000, max: 20 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Zu viele Anmeldeversuche. Bitte spaeter erneut versuchen.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } },
    )
  }

  const body = (await request.json().catch(() => ({}))) as LoginRequestBody
  const username = body.username?.trim() ?? ''
  const password = body.password ?? ''
  const remember = body.remember !== false

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Bitte Benutzername/E-Mail und Passwort eingeben.' },
      { status: 400 }
    )
  }

  let accountUrl: string
  try {
    accountUrl = resolveWordPressAccountUrl()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'WordPress-Konfiguration fehlt.' },
      { status: 500 }
    )
  }

  const loginPageResponse = await fetch(accountUrl, {
    method: 'GET',
    cache: 'no-store',
  })

  const loginPageHtml = await loginPageResponse.text()
  const nonce = extractInputValue(loginPageHtml, 'woocommerce-login-nonce')
  const referer = extractInputValue(loginPageHtml, '_wp_http_referer') || '/mein-konto/'

  if (!nonce) {
    return NextResponse.json(
      { error: 'Login-Nonce konnte nicht gelesen werden.' },
      { status: 502 }
    )
  }

  const formData = new URLSearchParams()
  formData.set('username', username)
  formData.set('password', password)
  if (remember) formData.set('rememberme', 'forever')
  formData.set('woocommerce-login-nonce', nonce)
  formData.set('_wp_http_referer', referer)
  formData.set('login', 'Anmelden')

  const loginSubmitResponse = await fetch(accountUrl, {
    method: 'POST',
    redirect: 'manual',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  const setCookieHeaders = getSetCookieHeaders(loginSubmitResponse)
  const cookieHeader = createCookieHeaderForWpRequest(setCookieHeaders)

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  let isLoggedIn = false
  if (graphqlUrl && cookieHeader) {
    isLoggedIn = await checkCustomerSession(graphqlUrl, cookieHeader)
  }

  if (!isLoggedIn) {
    const html = await loginSubmitResponse.text().catch(() => '')
    const wpError = extractWooErrorMessage(html)
    return NextResponse.json(
      { error: wpError || 'Anmeldung fehlgeschlagen. Bitte Zugangsdaten pruefen.' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true, status: 'SUCCESS' })
  appendAuthCookiesToResponse(response, setCookieHeaders, isRequestHttps(request))
  return response
}
