import { NextRequest, NextResponse } from 'next/server'
import { checkCustomerSession } from '@/features/auth/api/fetchCustomerAccount'

/**
 * POST: Zahlungsmethode im Kundenkonto speichern (Backend-Proxy).
 * Nimmt paymentMethodId (Stripe) oder provider-Token entgegen und leitet an WooCommerce weiter.
 * Session wird per Cookie geprüft.
 *
 * Body: { paymentMethodId?: string, gateway: 'stripe' | 'klarna' | 'paypal', token?: string }
 * Env: WC_ADD_PAYMENT_METHOD_API_URL (optional) – WordPress-Endpunkt, der die Zahlungsmethode speichert.
 */
export async function POST(request: NextRequest) {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL
  if (!graphqlUrl) {
    return NextResponse.json(
      { error: 'Konfiguration fehlt: NEXT_PUBLIC_GRAPHQL_URL' },
      { status: 500 }
    )
  }

  const cookie = request.headers.get('cookie') ?? ''
  const isLoggedIn = await checkCustomerSession(graphqlUrl, cookie)
  if (!isLoggedIn) {
    return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
  }

  let body: { paymentMethodId?: string; gateway?: string; token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger JSON-Body' }, { status: 400 })
  }

  const gateway = body.gateway
  if (!gateway || !['stripe', 'klarna', 'paypal'].includes(gateway)) {
    return NextResponse.json(
      { error: 'gateway muss stripe, klarna oder paypal sein' },
      { status: 400 }
    )
  }

  const backendUrl = process.env.WC_ADD_PAYMENT_METHOD_API_URL
  if (!backendUrl) {
    return NextResponse.json(
      {
        error:
          'Backend-URL nicht konfiguriert. Bitte WC_ADD_PAYMENT_METHOD_API_URL setzen (WordPress-Endpunkt zum Speichern der Zahlungsmethode).',
      },
      { status: 501 }
    )
  }

  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({
        paymentMethodId: body.paymentMethodId,
        gateway: body.gateway,
        token: body.token,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { message?: string }).message ?? 'Backend-Fehler' },
        { status: res.status }
      )
    }
    return NextResponse.json({ success: true, ...data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy-Fehler'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
