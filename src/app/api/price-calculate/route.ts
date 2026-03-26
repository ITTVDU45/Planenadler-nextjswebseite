import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/client-ip'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  buildWordPressPriceFormData,
  parsePriceCalculationResponse,
  type PriceCalculationRequestBody,
} from '@/lib/customizer-pricing'

const WP_AJAX_URL = process.env.WP_AJAX_URL ?? 'https://wp.planenadler.de/wp-admin/admin-ajax.php'
const MAX_BODY_BYTES = 256 * 1024
const UPSTREAM_TIMEOUT_MS = 25_000

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    const len = req.headers.get('content-length')
    if (len && Number(len) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload zu gross.' }, { status: 413 })
    }

    const bodyText = await req.text()
    if (bodyText.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload zu gross.' }, { status: 413 })
    }

    let body: PriceCalculationRequestBody
    try {
      body = JSON.parse(bodyText) as PriceCalculationRequestBody
    } catch {
      return NextResponse.json({ error: 'Ungueltiges JSON.' }, { status: 400 })
    }

    const productKey = String(body.productId ?? 'x')
    const rl = checkRateLimit(`price-calc:${ip}`, { windowMs: 60_000, max: 60 })
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Zu viele Preisanfragen. Bitte kurz warten.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec ?? 60) } },
      )
    }
    const rlProduct = checkRateLimit(`price-calc:${ip}:${productKey}`, { windowMs: 60_000, max: 45 })
    if (!rlProduct.ok) {
      return NextResponse.json(
        { error: 'Zu viele Preisanfragen fuer dieses Produkt.' },
        { status: 429, headers: { 'Retry-After': String(rlProduct.retryAfterSec ?? 60) } },
      )
    }

    if (!body.productId || !body.material) {
      return NextResponse.json(
        { error: 'productId und material sind erforderlich' },
        { status: 400 },
      )
    }

    const formData = buildWordPressPriceFormData(body)

    const ajaxSecret = process.env.PLANENADLER_AJAX_SECRET?.trim()
    const wpHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    if (ajaxSecret) {
      wpHeaders['X-Planenadler-Ajax-Secret'] = ajaxSecret
    }

    const wpRes = await fetch(WP_AJAX_URL, {
      method: 'POST',
      headers: wpHeaders,
      body: formData.toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!wpRes.ok) {
      return NextResponse.json(
        { error: 'WordPress-Preisberechnung fehlgeschlagen', status: wpRes.status },
        { status: 502 },
      )
    }

    let rawPrice: unknown
    try {
      rawPrice = await wpRes.json()
    } catch {
      return NextResponse.json(
        { error: 'WordPress hat keine gueltige JSON-Antwort fuer den Preis geliefert.' },
        { status: 502 },
      )
    }

    return NextResponse.json(parsePriceCalculationResponse(rawPrice))
  } catch (error) {
    const name = error instanceof Error ? error.name : ''
    if (name === 'TimeoutError' || name === 'AbortError') {
      return NextResponse.json({ error: 'Preisberechnung hat zu lange gedauert.' }, { status: 504 })
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Interner Server-Fehler bei der Preisberechnung',
      },
      { status: 500 },
    )
  }
}
