import { NextRequest, NextResponse } from 'next/server'
import { checkCustomerSession } from '@/features/auth/api/fetchCustomerAccount'
import {
  appendAuthCookiesToResponse,
  createCookieHeaderForWpRequest,
  extractInputValue,
  extractWooErrorMessage,
  getSetCookieHeaders,
  resolveWordPressAccountUrl,
  validateSameOrigin,
} from '../_lib'

type RegisterRequestBody = {
  email?: string
}

export async function POST(request: NextRequest) {
  const sameOriginError = validateSameOrigin(request)
  if (sameOriginError) {
    return NextResponse.json({ error: sameOriginError }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as RegisterRequestBody
  const email = body.email?.trim() ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Bitte E-Mail-Adresse eingeben.' }, { status: 400 })
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

  const registerPageResponse = await fetch(accountUrl, {
    method: 'GET',
    cache: 'no-store',
  })

  const registerPageHtml = await registerPageResponse.text()
  const nonce = extractInputValue(registerPageHtml, 'woocommerce-register-nonce')
  const referer = extractInputValue(registerPageHtml, '_wp_http_referer') || '/mein-konto/'

  if (!nonce) {
    return NextResponse.json(
      { error: 'Registrierungs-Nonce konnte nicht gelesen werden.' },
      { status: 502 }
    )
  }

  const formData = new URLSearchParams()
  formData.set('email', email)
  formData.set('woocommerce-register-nonce', nonce)
  formData.set('_wp_http_referer', referer)
  formData.set('register', 'Registrieren')

  const registerSubmitResponse = await fetch(accountUrl, {
    method: 'POST',
    redirect: 'manual',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  const setCookieHeaders = getSetCookieHeaders(registerSubmitResponse)
  const cookieHeader = createCookieHeaderForWpRequest(setCookieHeaders)

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  let isLoggedIn = false
  if (graphqlUrl && cookieHeader) {
    isLoggedIn = await checkCustomerSession(graphqlUrl, cookieHeader)
  }

  if (!isLoggedIn) {
    const html = await registerSubmitResponse.text().catch(() => '')
    const wpError = extractWooErrorMessage(html)
    if (wpError) {
      return NextResponse.json({ error: wpError }, { status: 400 })
    }
  }

  const response = NextResponse.json({
    success: true,
    status: 'SUCCESS',
    loggedIn: isLoggedIn,
    message: isLoggedIn
      ? 'Konto erstellt und angemeldet.'
      : 'Registrierung erfolgreich. Bitte E-Mail pruefen.',
  })

  const isHttps = request.nextUrl.protocol === 'https:'
  appendAuthCookiesToResponse(response, setCookieHeaders, isHttps)
  return response
}
