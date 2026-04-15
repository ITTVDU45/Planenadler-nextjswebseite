import { NextRequest, NextResponse } from 'next/server'
import {
  resolveCheckoutGateways,
  type PaymentOptionsResponse,
} from '@/features/checkout/lib/payment-gateways'
import {
  mergeUniquePaymentMethodIds,
  normalizeStoreApiPaymentMethods,
} from '@/features/checkout/lib/store-api-payment-methods'
import { buildWooStoreApiHeaders, readWooSessionTokenFromRequest } from '@/lib/woo-session-cookie'

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

function resolveStoreApiCheckoutUrl(): string {
  const explicit =
    process.env.WC_PROVIDER_CHECKOUT_API_URL?.trim() ??
    process.env.WC_STRIPE_CHECKOUT_API_URL?.trim() ??
    process.env.WC_PAYPAL_CHECKOUT_API_URL?.trim() ??
    process.env.WC_KLARNA_CHECKOUT_API_URL?.trim() ??
    ''
  if (explicit) return explicit

  const origin = resolveWordPressOrigin()
  return origin ? `${origin}/wp-json/wc/store/v1/checkout` : ''
}

function toStoreApiCartUrl(checkoutUrl: string): string {
  return checkoutUrl.replace(/\/checkout\/?$/i, '/cart')
}

async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>
}

export async function GET(request: NextRequest) {
  const upstreamUrl = resolveStoreApiCheckoutUrl()
  if (!upstreamUrl) {
    return NextResponse.json(
      {
        error: 'WooCommerce Store API URL konnte nicht aufgeloest werden.',
      },
      { status: 501 }
    )
  }

  const cartUrl = toStoreApiCartUrl(upstreamUrl)
  const cookie = request.headers.get('cookie') ?? ''
  const storeHeaders = buildWooStoreApiHeaders(request)
  const sessionToken = readWooSessionTokenFromRequest(request)
  const errors: string[] = []

  try {
    const cartResponse = await fetch(cartUrl, {
      method: 'GET',
      headers: Object.keys(storeHeaders).length > 0 ? storeHeaders : undefined,
      cache: 'no-store',
    })
    const cartData = await parseJsonSafe(cartResponse)

    const checkoutResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers: Object.keys(storeHeaders).length > 0 ? storeHeaders : undefined,
      cache: 'no-store',
    })
    const checkoutBootstrapOk = checkoutResponse.ok || checkoutResponse.status === 401

    if (!cartResponse.ok) {
      errors.push(
        (typeof cartData.message === 'string' && cartData.message) || 'Store API Cart konnte nicht geladen werden.'
      )
    }

    if (!checkoutBootstrapOk) {
      errors.push('Store API Checkout-Bootstrap konnte nicht geladen werden.')
    }

    const checkoutData = checkoutBootstrapOk ? await parseJsonSafe(checkoutResponse) : {}
    const experimentalCart =
      checkoutData && typeof checkoutData === 'object' && '__experimentalCart' in checkoutData
        ? (checkoutData as { __experimentalCart?: Record<string, unknown> }).__experimentalCart
        : undefined

    let availablePaymentMethods = mergeUniquePaymentMethodIds(
      normalizeStoreApiPaymentMethods(cartData.payment_methods),
      normalizeStoreApiPaymentMethods(
        checkoutData && typeof checkoutData === 'object' && 'payment_methods' in checkoutData
          ? (checkoutData as { payment_methods?: unknown }).payment_methods
          : undefined
      ),
      normalizeStoreApiPaymentMethods(experimentalCart?.payment_methods)
    )

    // Headless: Store API listet „bacs“ oft nicht, WooGraphQL-Checkout unterstützt ihn trotzdem.
    // Opt-out (z. B. wenn Banküberweisung in Woo wirklich deaktiviert): CHECKOUT_SUPPLEMENT_BACS=0
    const supplementBacs = process.env.CHECKOUT_SUPPLEMENT_BACS?.trim() !== '0'
    if (supplementBacs) {
      availablePaymentMethods = mergeUniquePaymentMethodIds(availablePaymentMethods, ['bacs'])
    }
    const paymentRequirements = Array.isArray(cartData.payment_requirements)
      ? cartData.payment_requirements.filter((entry): entry is string => typeof entry === 'string')
      : []
    const cartItems = Array.isArray(cartData.items) ? cartData.items : []
    const hasStripeKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim())

    let gateways = resolveCheckoutGateways(availablePaymentMethods, hasStripeKey)

    const explicitBankId = process.env.WC_CHECKOUT_BANK_PAYMENT_METHOD_ID?.trim()
    if (explicitBankId) {
      gateways = gateways.map((g) =>
        g.id === 'bacs'
          ? {
              ...g,
              wcPaymentMethodId: explicitBankId,
              available: true,
              frontendReady: true,
              expressEligible: false,
            }
          : g,
      )
    }

    const payload: PaymentOptionsResponse = {
      gateways,
      diagnostics: {
        upstreamUrl,
        cartUrl,
        cartFetchOk: cartResponse.ok,
        checkoutBootstrapOk,
        cookiePresent: cookie.length > 0,
        wooSessionHeaderSent: Boolean(sessionToken),
        cartItemCount: cartItems.length,
        availablePaymentMethods,
        paymentRequirements,
        errors,
      },
    }

    return NextResponse.json(payload, {
      status: cartResponse.ok || checkoutResponse.ok ? 200 : 502,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'WooCommerce Payment Discovery fehlgeschlagen.',
      },
      { status: 502 }
    )
  }
}
