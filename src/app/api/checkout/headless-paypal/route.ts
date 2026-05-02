import { NextRequest, NextResponse } from 'next/server'

type CheckoutInputShape = {
  billing?: Record<string, unknown>
  shipping?: Record<string, unknown>
}

type CheckoutItemShape = {
  productId?: number
  quantity?: number
  extraData?: string
}

type StartBody = {
  action?: 'start' | 'capture'
  checkoutInput?: CheckoutInputShape
  checkoutItems?: CheckoutItemShape[]
  coupons?: string[]
  returnUrl?: string
  cancelUrl?: string
  orderId?: string | number
  paypalOrderId?: string
}

function resolveWordPressOrigin(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim(),
    process.env.CUSTOMIZER_API_URL?.trim(),
    process.env.WC_HEADLESS_PAYPAL_API_URL?.trim(),
    process.env.WC_PROVIDER_CHECKOUT_API_URL?.trim(),
  ].filter((value): value is string => Boolean(value))

  for (const candidate of candidates) {
    if (/\/graphql\/?$/i.test(candidate)) {
      return candidate.replace(/\/graphql\/?$/i, '')
    }
    if (/\/wp-json\/.+$/i.test(candidate)) {
      return candidate.replace(/\/wp-json\/.+$/i, '')
    }
  }

  return ''
}

function resolveHeadlessApiBaseUrl(): string {
  const explicit = process.env.WC_HEADLESS_PAYPAL_API_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/+$/g, '')
  }

  const origin = resolveWordPressOrigin()
  return origin ? `${origin}/wp-json/planenadler-headless/v1` : ''
}

function getHeadlessApiSecret(): string {
  return (
    process.env.PLANENADLER_HEADLESS_API_SECRET?.trim() ??
    process.env.WC_PROVIDER_API_SECRET?.trim() ??
    ''
  )
}

function normalizeMetaData(extraData?: string): Record<string, unknown> {
  if (!extraData) return {}
  try {
    const decoded = JSON.parse(extraData) as unknown
    return decoded && typeof decoded === 'object' && !Array.isArray(decoded)
      ? (decoded as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}

async function postHeadlessEndpoint(
  path: string,
  payload: Record<string, unknown>
): Promise<{ response: Response; data: Record<string, unknown> }> {
  const baseUrl = resolveHeadlessApiBaseUrl()
  if (!baseUrl) {
    throw new Error('WC_HEADLESS_PAYPAL_API_URL konnte nicht aufgeloest werden.')
  }

  const secret = getHeadlessApiSecret()
  if (!secret) {
    throw new Error('PLANENADLER_HEADLESS_API_SECRET fehlt.')
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Planenadler-Headless-Key': secret,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  return { response, data: await parseJsonSafe(response) }
}

export async function POST(request: NextRequest) {
  let body: StartBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungueltiger JSON-Body' }, { status: 400 })
  }

  const action = body.action ?? 'start'

  try {
    if (action === 'start') {
      const checkoutItems = Array.isArray(body.checkoutItems) ? body.checkoutItems : []
      const items = checkoutItems
        .filter((item): item is CheckoutItemShape => Boolean(item && item.productId && item.quantity))
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          metaData: normalizeMetaData(item.extraData),
        }))

      if (items.length === 0) {
        return NextResponse.json({ error: 'Keine Checkout-Artikel vorhanden.' }, { status: 400 })
      }

      const createOrderPayload: Record<string, unknown> = {
        items,
        billing: body.checkoutInput?.billing ?? {},
        shipping: body.checkoutInput?.shipping ?? {},
        coupons: Array.isArray(body.coupons) ? body.coupons.filter((code): code is string => typeof code === 'string' && code.trim().length > 0) : [],
        returnUrl: body.returnUrl ?? '',
        cancelUrl: body.cancelUrl ?? '',
      }

      const { response: orderResponse, data: orderData } = await postHeadlessEndpoint(
        '/create-headless-order',
        createOrderPayload
      )
      if (!orderResponse.ok) {
        return NextResponse.json(
          { error: (orderData.message as string | undefined) ?? 'Woo-Bestellung konnte nicht angelegt werden.' },
          { status: orderResponse.status }
        )
      }

      const orderId = orderData.orderId
      if (typeof orderId !== 'number' && typeof orderId !== 'string') {
        return NextResponse.json({ error: 'Backend hat keine orderId geliefert.' }, { status: 502 })
      }

      const { response: paypalResponse, data: paypalData } = await postHeadlessEndpoint(
        '/create-paypal-order',
        { orderId }
      )
      if (!paypalResponse.ok) {
        return NextResponse.json(
          { error: (paypalData.message as string | undefined) ?? 'PayPal Order konnte nicht erstellt werden.' },
          { status: paypalResponse.status }
        )
      }

      const approveUrl = typeof paypalData.approveUrl === 'string' ? paypalData.approveUrl : ''
      const paypalOrderId = typeof paypalData.paypalOrderId === 'string' ? paypalData.paypalOrderId : ''

      if (!approveUrl || !paypalOrderId) {
        return NextResponse.json({ error: 'PayPal Approve-URL oder Order-ID fehlt.' }, { status: 502 })
      }

      return NextResponse.json({
        orderId: String(orderId),
        orderKey: typeof orderData.orderKey === 'string' ? orderData.orderKey : null,
        orderNumber: orderData.orderNumber ?? null,
        paypalOrderId,
        approveUrl,
      })
    }

    if (action === 'capture') {
      const orderId = typeof body.orderId === 'string' || typeof body.orderId === 'number' ? body.orderId : ''
      const paypalOrderId = typeof body.paypalOrderId === 'string' ? body.paypalOrderId : ''

      if (!orderId) {
        return NextResponse.json({ error: 'orderId fehlt.' }, { status: 400 })
      }

      const { response, data } = await postHeadlessEndpoint('/capture-paypal-order', {
        orderId,
        paypalOrderId,
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: (data.message as string | undefined) ?? 'PayPal Capture fehlgeschlagen.' },
          { status: response.status }
        )
      }

      return NextResponse.json({
        orderId: data.orderId ?? orderId,
        paypalOrderId: data.paypalOrderId ?? paypalOrderId,
        captureId: data.captureId ?? null,
        paypalStatus: data.paypalStatus ?? null,
        orderStatus: data.orderStatus ?? null,
      })
    }

    return NextResponse.json({ error: 'Unbekannte action.' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Headless PayPal Proxy-Fehler' },
      { status: 502 }
    )
  }
}
