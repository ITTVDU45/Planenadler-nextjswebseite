import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

type Provider = 'card' | 'klarna' | 'paypal'

interface BodyShape {
  provider?: Provider
  checkoutInput?: unknown
}

interface CheckoutInputShape {
  billing?: {
    firstName?: string
    lastName?: string
    company?: string
    country?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postcode?: string
    phone?: string
    email?: string
  }
  shipping?: {
    firstName?: string
    lastName?: string
    company?: string
    country?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postcode?: string
    phone?: string
  }
}

type JsonPayload = Record<string, unknown>

function resolveWordPressOrigin(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim(),
    process.env.CUSTOMIZER_API_URL?.trim(),
    process.env.WC_PROVIDER_CHECKOUT_API_URL?.trim(),
    process.env.WC_STRIPE_CHECKOUT_API_URL?.trim(),
    process.env.WC_PAYPAL_CHECKOUT_API_URL?.trim(),
    process.env.WC_KLARNA_CHECKOUT_API_URL?.trim(),
  ].filter((value): value is string => Boolean(value))

  for (const candidate of candidates) {
    if (/\/wp-json\/wc\/store\/v1\/checkout\/?$/i.test(candidate)) {
      return candidate.replace(/\/wp-json\/wc\/store\/v1\/checkout\/?$/i, '')
    }
    if (/\/graphql\/?$/i.test(candidate)) {
      return candidate.replace(/\/graphql\/?$/i, '')
    }
    if (/\/wp-json\/.+$/i.test(candidate)) {
      return candidate.replace(/\/wp-json\/.+$/i, '')
    }
  }

  return ''
}

function resolveDefaultStoreApiCheckoutUrl(): string {
  const origin = resolveWordPressOrigin()
  return origin ? `${origin}/wp-json/wc/store/v1/checkout` : ''
}

function resolveUpstreamUrl(provider: Provider): string {
  const sharedProviderUrl = process.env.WC_PROVIDER_CHECKOUT_API_URL?.trim()
  if (sharedProviderUrl) return sharedProviderUrl
  if (provider === 'card') return process.env.WC_STRIPE_CHECKOUT_API_URL ?? resolveDefaultStoreApiCheckoutUrl()
  if (provider === 'klarna') return process.env.WC_KLARNA_CHECKOUT_API_URL ?? resolveDefaultStoreApiCheckoutUrl()
  return process.env.WC_PAYPAL_CHECKOUT_API_URL ?? resolveDefaultStoreApiCheckoutUrl()
}

function resolvePaymentMethodId(provider: Provider): string {
  if (provider === 'card') {
    return process.env.WC_STRIPE_PAYMENT_METHOD_ID ?? 'stripe'
  }
  if (provider === 'klarna') {
    return process.env.WC_KLARNA_PAYMENT_METHOD_ID ?? 'stripe_klarna'
  }
  return process.env.WC_PAYPAL_PAYMENT_METHOD_ID ?? 'ppcp'
}

function isStoreApiCheckoutUrl(url: string): boolean {
  return /\/wp-json\/wc\/store\/v1\/checkout\/?$/.test(url)
}

function isPlanenadlerCustomEndpoint(url: string): boolean {
  return /\/wp-json\/planenadler\/v1\//.test(url)
}

function resolveStoreApiFallbackUrl(provider: Provider): string {
  if (provider === 'card') return process.env.WC_STRIPE_CHECKOUT_API_URL ?? resolveDefaultStoreApiCheckoutUrl()
  if (provider === 'klarna') return process.env.WC_KLARNA_CHECKOUT_API_URL ?? resolveDefaultStoreApiCheckoutUrl()
  return process.env.WC_PAYPAL_CHECKOUT_API_URL ?? resolveDefaultStoreApiCheckoutUrl()
}

function getProviderPaymentAliases(provider: Provider): string[] {
  if (provider === 'card') {
    return ['woocommerce_payments', 'wcpay', 'stripe', 'stripe_cc', 'stripe_credit_card', 'credit_card']
  }
  if (provider === 'klarna') {
    return ['stripe_klarna', 'woocommerce_payments_klarna', 'klarna_payments', 'klarna', 'kco']
  }
  return ['ppcp', 'ppcp-gateway', 'paypal', 'paypal_checkout', 'ppec_paypal']
}

function pickBestPaymentMethodId(
  provider: Provider,
  configuredId: string,
  availableMethods: string[]
): string {
  if (!availableMethods.length) return configuredId

  const byLower = new Map<string, string>()
  for (const id of availableMethods) byLower.set(id.toLowerCase(), id)

  const direct = byLower.get(configuredId.toLowerCase())
  if (direct) return direct

  for (const candidate of getProviderPaymentAliases(provider)) {
    const match = byLower.get(candidate.toLowerCase())
    if (match) return match
  }

  for (const [lower, original] of byLower.entries()) {
    if (lower.includes(provider)) return original
  }

  return configuredId
}

function toStoreApiCartUrl(checkoutUrl: string): string {
  return checkoutUrl.replace(/\/checkout\/?$/i, '/cart')
}

function toStoreApiPayload(input: CheckoutInputShape, paymentMethodId: string) {
  const billing = input.billing ?? {}
  const shipping = input.shipping ?? billing

  return {
    billing_address: {
      first_name: billing.firstName ?? '',
      last_name: billing.lastName ?? '',
      company: billing.company ?? '',
      country: billing.country ?? 'DE',
      address_1: billing.address1 ?? '',
      address_2: billing.address2 ?? '',
      city: billing.city ?? '',
      state: billing.state ?? '',
      postcode: billing.postcode ?? '',
      phone: billing.phone ?? '',
      email: billing.email ?? '',
    },
    shipping_address: {
      first_name: shipping.firstName ?? billing.firstName ?? '',
      last_name: shipping.lastName ?? billing.lastName ?? '',
      company: shipping.company ?? '',
      country: shipping.country ?? billing.country ?? 'DE',
      address_1: shipping.address1 ?? billing.address1 ?? '',
      address_2: shipping.address2 ?? '',
      city: shipping.city ?? billing.city ?? '',
      state: shipping.state ?? billing.state ?? '',
      postcode: shipping.postcode ?? billing.postcode ?? '',
      phone: shipping.phone ?? billing.phone ?? '',
    },
    payment_method: paymentMethodId,
    payment_data: [],
  }
}

function extractRedirectUrl(data: Record<string, unknown>): string {
  const direct = data.redirectUrl
  if (typeof direct === 'string') return direct

  const altDirect = data.redirect
  if (typeof altDirect === 'string') return altDirect

  const storeApi = data.redirect_url
  if (typeof storeApi === 'string') return storeApi

  const paymentResult = data.payment_result
  if (paymentResult && typeof paymentResult === 'object') {
    const resultRedirect = (paymentResult as { redirect_url?: unknown }).redirect_url
    if (typeof resultRedirect === 'string') return resultRedirect
  }

  return ''
}

function extractErrorMessage(data: Record<string, unknown>, fallback: string): string {
  return (
    (data.error as string | undefined) ??
    (data.message as string | undefined) ??
    (data.code as string | undefined) ??
    fallback
  )
}

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}

function isReplayDetected(response: Response, data: Record<string, unknown>): boolean {
  const code = typeof data.code === 'string' ? data.code : ''
  return response.status === 409 && code === 'replay_detected'
}

async function postCustomEndpoint(
  upstreamUrl: string,
  cookie: string,
  payload: Record<string, unknown>
): Promise<{ response: Response; data: Record<string, unknown> }> {
  let response: Response | null = null
  let data: Record<string, unknown> = {}

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const requestBody = JSON.stringify({
      ...payload,
      requestId: `${Date.now()}-${attempt}`,
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    }

    if (isPlanenadlerCustomEndpoint(upstreamUrl) && process.env.WC_PROVIDER_API_SECRET) {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const signature = createHmac('sha256', process.env.WC_PROVIDER_API_SECRET)
        .update(`${timestamp}.${requestBody}`)
        .digest('hex')
      headers['X-Planenadler-Timestamp'] = timestamp
      headers['X-Planenadler-Signature'] = signature
      headers['X-Planenadler-Client'] = 'nextjs-woocommerce'
    }

    response = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      redirect: 'manual',
      body: requestBody,
    })
    data = await parseJsonSafe(response)

    if (!isReplayDetected(response, data)) break
  }

  if (!response) {
    throw new Error('Keine Antwort vom Provider-Endpoint erhalten')
  }

  return { response, data }
}

function shouldFallbackToStoreApi(
  provider: Provider,
  upstreamUrl: string,
  upstreamStatus: number,
  data: JsonPayload
): boolean {
  if (!isPlanenadlerCustomEndpoint(upstreamUrl)) return false
  const fallback = resolveStoreApiFallbackUrl(provider)
  if (!fallback || !isStoreApiCheckoutUrl(fallback)) return false

  const errorText = extractErrorMessage(data, '').toLowerCase()
  const errorCode = (typeof data.code === 'string' ? data.code : '').toLowerCase()

  if (errorText.includes('cart is not available')) return true
  if (errorText.includes('warenkorb')) return true
  if (errorCode.includes('cart')) return true

  // Custom endpoint implementations vary; retry against Store API for common 4xx/5xx path.
  return upstreamStatus >= 400
}

async function executeStoreApiCheckout(
  provider: Provider,
  upstreamUrl: string,
  cookie: string,
  checkoutInput: CheckoutInputShape
): Promise<{ status: number; payload: JsonPayload }> {
  const cartEndpoint = toStoreApiCartUrl(upstreamUrl)
  const cartRes = await fetch(cartEndpoint, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  })
  const cartData = await parseJsonSafe(cartRes)

  const bootstrap = await fetch(upstreamUrl, {
    method: 'GET',
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  })
  const nonce = bootstrap.headers.get('nonce') ?? ''
  const cartToken = bootstrap.headers.get('cart-token') ?? cartRes.headers.get('cart-token') ?? ''
  const cartNonce = cartRes.headers.get('nonce') ?? nonce

  const availablePaymentMethods = Array.isArray(cartData.payment_methods)
    ? cartData.payment_methods.filter((method): method is string => typeof method === 'string')
    : []

  const selectedPaymentMethodId = pickBestPaymentMethodId(
    provider,
    resolvePaymentMethodId(provider),
    availablePaymentMethods
  )

  const payload = toStoreApiPayload(checkoutInput, selectedPaymentMethodId)
  const checkoutRes = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...(cartNonce ? { Nonce: cartNonce } : {}),
      ...(cartToken ? { 'Cart-Token': cartToken } : {}),
    },
    body: JSON.stringify(payload),
  })

  const checkoutData = await parseJsonSafe(checkoutRes)
  const redirectUrl = extractRedirectUrl(checkoutData)

  if (!checkoutRes.ok) {
    return {
      status: checkoutRes.status,
      payload: {
        error: extractErrorMessage(checkoutData, 'Store API Checkout Fehler'),
        paymentMethodId: selectedPaymentMethodId,
        availablePaymentMethods,
        upstream: upstreamUrl,
      },
    }
  }

  if (!redirectUrl) {
    return {
      status: 502,
      payload: {
        error: 'Store API hat keine redirect_url geliefert',
        paymentMethodId: selectedPaymentMethodId,
        availablePaymentMethods,
      },
    }
  }

  return {
    status: 200,
    payload: {
      redirectUrl,
      paymentMethodId: selectedPaymentMethodId,
    },
  }
}

export async function POST(request: NextRequest) {
  let body: BodyShape
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungueltiger JSON-Body' }, { status: 400 })
  }

  const provider = body.provider
  if (provider !== 'card' && provider !== 'klarna' && provider !== 'paypal') {
    return NextResponse.json({ error: 'provider muss card, klarna oder paypal sein' }, { status: 400 })
  }

  const upstreamUrl = resolveUpstreamUrl(provider)
  if (!upstreamUrl) {
    const varName =
      provider === 'card'
        ? 'WC_STRIPE_CHECKOUT_API_URL'
        : provider === 'klarna'
          ? 'WC_KLARNA_CHECKOUT_API_URL'
          : 'WC_PAYPAL_CHECKOUT_API_URL'
    return NextResponse.json({ error: `Konfiguration fehlt: ${varName}` }, { status: 501 })
  }

  const cookie = request.headers.get('cookie') ?? ''

  try {
    if (isStoreApiCheckoutUrl(upstreamUrl)) {
      const result = await executeStoreApiCheckout(
        provider,
        upstreamUrl,
        cookie,
        (body.checkoutInput ?? {}) as CheckoutInputShape
      )
      return NextResponse.json(result.payload, { status: result.status })
    }

    const upstreamPayload: Record<string, unknown> = {
      provider,
      checkoutInput: body.checkoutInput ?? null,
    }
    const { response: upstream, data } = await postCustomEndpoint(upstreamUrl, cookie, upstreamPayload)

    const location = upstream.headers.get('location')
    if (location && upstream.status >= 300 && upstream.status <= 399) {
      return NextResponse.json({ redirectUrl: location })
    }

    const redirectUrl = extractRedirectUrl(data)

    if (!upstream.ok) {
      if (
        shouldFallbackToStoreApi(provider, upstreamUrl, upstream.status, data)
      ) {
        const fallbackUrl = resolveStoreApiFallbackUrl(provider)
        if (fallbackUrl && isStoreApiCheckoutUrl(fallbackUrl)) {
          const fallback = await executeStoreApiCheckout(
            provider,
            fallbackUrl,
            cookie,
            (body.checkoutInput ?? {}) as CheckoutInputShape
          )
          return NextResponse.json(fallback.payload, { status: fallback.status })
        }
      }

      return NextResponse.json(
        {
          error: extractErrorMessage(data, 'Backend-Fehler'),
          code: typeof data.code === 'string' ? data.code : undefined,
          upstream: upstreamUrl,
        },
        { status: upstream.status }
      )
    }

    if (!redirectUrl) {
      return NextResponse.json({ error: 'Keine redirectUrl vom Backend erhalten' }, { status: 502 })
    }

    return NextResponse.json({ redirectUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy-Fehler' },
      { status: 502 }
    )
  }
}
