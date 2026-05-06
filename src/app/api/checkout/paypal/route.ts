import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_API_BASE = (process.env.PAYPAL_API_BASE ?? 'https://api-m.paypal.com').replace(/\/+$/, '')

function getWpBase(): string {
  const fromGraphql = process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace(/\/graphql\/?$/i, '').trim()
  const fromHeadless = process.env.WC_HEADLESS_PAYPAL_API_URL?.replace(/\/wp-json\/.+$/i, '').trim()
  return fromGraphql || fromHeadless || ''
}

function getHeadlessBaseUrl(): string {
  const explicit = process.env.WC_HEADLESS_PAYPAL_API_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const wpBase = getWpBase()
  return wpBase ? `${wpBase}/wp-json/planenadler-headless/v1` : ''
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? ''
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? ''
  if (!clientId || !clientSecret) throw new Error('PayPal Client ID oder Secret fehlen in der Konfiguration.')

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('PayPal Authentifizierung fehlgeschlagen. Bitte Client ID und Secret prüfen.')
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

async function createWooOrder(payload: Record<string, unknown>): Promise<{ orderId: string | number; orderKey: string | null }> {
  const baseUrl = getHeadlessBaseUrl()
  if (!baseUrl) throw new Error('WooCommerce Headless API URL konnte nicht aufgelöst werden.')

  const secret = process.env.PLANENADLER_HEADLESS_API_SECRET?.trim() ?? ''
  if (!secret) throw new Error('PLANENADLER_HEADLESS_API_SECRET fehlt.')

  const res = await fetch(`${baseUrl}/create-headless-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Planenadler-Headless-Key': secret,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) throw new Error((data.message as string | undefined) ?? 'WooCommerce Bestellung konnte nicht angelegt werden.')

  const orderId = data.orderId as string | number | undefined
  if (!orderId) throw new Error('WordPress hat keine orderId zurückgegeben.')

  return { orderId, orderKey: (data.orderKey as string | null) ?? null }
}

async function getWcOrderTotal(orderId: string | number): Promise<{ total: string; currency: string }> {
  const wpBase = getWpBase()
  const key = process.env.WC_CONSUMER_KEY?.trim() ?? ''
  const secret = process.env.WC_CONSUMER_SECRET?.trim() ?? ''

  if (!key || !secret) throw new Error('WC_CONSUMER_KEY oder WC_CONSUMER_SECRET fehlen in der Konfiguration.')

  const creds = Buffer.from(`${key}:${secret}`).toString('base64')
  const res = await fetch(`${wpBase}/wp-json/wc/v3/orders/${orderId}`, {
    headers: { Authorization: `Basic ${creds}` },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('WooCommerce Bestelldetails konnten nicht geladen werden.')
  const data = (await res.json()) as { total?: string; currency?: string }
  return { total: data.total ?? '0', currency: data.currency ?? 'EUR' }
}

async function createPayPalOrder(
  accessToken: string,
  amount: string,
  currency: string,
  wooOrderId: string | number,
): Promise<string> {
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `woo-${wooOrderId}-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: String(wooOrderId),
          amount: { currency_code: currency, value: amount },
        },
      ],
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>
    throw new Error((err.message as string | undefined) ?? 'PayPal Order konnte nicht erstellt werden.')
  }

  const data = (await res.json()) as { id: string }
  return data.id
}

async function capturePayPalOrder(
  accessToken: string,
  paypalOrderId: string,
): Promise<{ captureId: string; status: string; amount: string; currency: string }> {
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `capture-${paypalOrderId}`,
    },
    body: '{}',
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>
    throw new Error((err.message as string | undefined) ?? 'PayPal Capture fehlgeschlagen.')
  }

  const data = (await res.json()) as {
    status: string
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id: string
          status: string
          amount?: { value: string; currency_code: string }
        }>
      }
    }>
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
  if (!capture?.id) throw new Error('PayPal Capture ID fehlt in der Antwort.')

  return {
    captureId: capture.id,
    status: capture.status ?? data.status,
    amount: capture.amount?.value ?? '0',
    currency: capture.amount?.currency_code ?? 'EUR',
  }
}

async function markWcOrderPaid(orderId: string | number, captureId: string): Promise<void> {
  const wpBase = getWpBase()
  const key = process.env.WC_CONSUMER_KEY?.trim() ?? ''
  const secret = process.env.WC_CONSUMER_SECRET?.trim() ?? ''

  if (!key || !secret) throw new Error('WC_CONSUMER_KEY oder WC_CONSUMER_SECRET fehlen in der Konfiguration.')

  const creds = Buffer.from(`${key}:${secret}`).toString('base64')
  const res = await fetch(`${wpBase}/wp-json/wc/v3/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'processing',
      set_paid: true,
      transaction_id: captureId,
    }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error('WooCommerce Bestellung konnte nicht als bezahlt markiert werden.')
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger JSON-Body' }, { status: 400 })
  }

  const action = body.action as string

  try {
    if (action === 'create-order') {
      const billing = body.billing as Record<string, unknown>
      const shipping = body.shipping as Record<string, unknown>
      const items = body.items as unknown[]
      const coupons = body.coupons as string[]

      if (!items?.length) {
        return NextResponse.json({ error: 'Keine Artikel im Warenkorb.' }, { status: 400 })
      }

      const { orderId: wooOrderId, orderKey } = await createWooOrder({
        items,
        billing: billing ?? {},
        shipping: shipping ?? {},
        coupons: coupons ?? [],
        returnUrl: '',
        cancelUrl: '',
      })

      const { total, currency } = await getWcOrderTotal(wooOrderId)
      const accessToken = await getPayPalAccessToken()
      const paypalOrderId = await createPayPalOrder(accessToken, total, currency, wooOrderId)

      return NextResponse.json({ paypalOrderId, wooOrderId: String(wooOrderId), orderKey })
    }

    if (action === 'capture-order') {
      const paypalOrderId = body.paypalOrderId as string | undefined
      const wooOrderId = body.wooOrderId as string | undefined

      if (!paypalOrderId || !wooOrderId) {
        return NextResponse.json({ error: 'paypalOrderId und wooOrderId sind erforderlich.' }, { status: 400 })
      }

      const accessToken = await getPayPalAccessToken()
      const { captureId, status } = await capturePayPalOrder(accessToken, paypalOrderId)

      if (status !== 'COMPLETED') {
        return NextResponse.json(
          { error: `PayPal Zahlung nicht abgeschlossen. Status: ${status}` },
          { status: 400 },
        )
      }

      await markWcOrderPaid(wooOrderId, captureId)

      return NextResponse.json({ captureId, wooOrderId, orderStatus: 'processing' })
    }

    return NextResponse.json({ error: 'Unbekannte action.' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fehler bei der PayPal-Verarbeitung.' },
      { status: 502 },
    )
  }
}
