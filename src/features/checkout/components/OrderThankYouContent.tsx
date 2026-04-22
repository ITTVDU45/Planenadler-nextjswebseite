'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCheckoutStore, type LastCompletedOrderSnapshot } from '../store/checkout.store'
import { CheckoutSteps } from './CheckoutSteps'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { PAYMENT_METHOD_IDS } from '../types/checkout.types'
import {
  decodePriceDisplay,
  getEffectiveShippingTotal,
  getAbsoluteImageUrl,
  parseCartPriceString,
} from '@/shared/lib/functions'
import { GoogleAdsPurchaseTracker } from '@/components/analytics/google-ads-purchase-tracker'
import { pushPurchaseEvent } from '@/lib/tracking/purchase'

const CART_PATH = '/cart'
const THANK_YOU_MAX_AGE_MS = 48 * 60 * 60 * 1000

function isThankYouEligible(
  orderCompleted: boolean,
  lastCompletedOrder: LastCompletedOrderSnapshot | null,
): boolean {
  if (orderCompleted) return true
  if (!lastCompletedOrder) return false
  return Date.now() - lastCompletedOrder.completedAt < THANK_YOU_MAX_AGE_MS
}

function formatOrderDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function OrderThankYouContent() {
  const router = useRouter()
  const orderCompleted = useCheckoutStore((s) => s.orderCompleted)
  const lastCompletedOrder = useCheckoutStore((s) => s.lastCompletedOrder)
  const selectedPayment = useCheckoutStore((s) => s.selectedPayment)
  const reset = useCheckoutStore((s) => s.reset)

  const [hydrated, setHydrated] = useState(() => {
    const api = useCheckoutStore.persist
    return api ? api.hasHydrated() : true
  })
  const purchasePushAttempted = useRef(false)

  useEffect(() => {
    const api = useCheckoutStore.persist
    if (!api || hydrated || api.hasHydrated()) {
      return
    }
    const unsub = api.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (!isThankYouEligible(orderCompleted, lastCompletedOrder)) {
      router.replace(CART_PATH)
    }
  }, [hydrated, orderCompleted, lastCompletedOrder, router])

  const showBankHint = selectedPayment === PAYMENT_METHOD_IDS.BANK
  const orderLabel =
    lastCompletedOrder?.orderNumber != null && lastCompletedOrder.orderNumber !== ''
      ? String(lastCompletedOrder.orderNumber)
      : lastCompletedOrder?.databaseId != null && lastCompletedOrder.databaseId !== ''
        ? String(lastCompletedOrder.databaseId)
        : null

  const receipt = lastCompletedOrder?.receipt
  const formattedDate = formatOrderDate(lastCompletedOrder?.date)

  const adsTransactionId =
    lastCompletedOrder?.databaseId ??
    (lastCompletedOrder?.orderNumber != null ? String(lastCompletedOrder.orderNumber) : null) ??
    `session-${lastCompletedOrder?.completedAt ?? 0}`

  const adsValueEuro =
    receipt?.totals?.total != null
      ? (() => {
          const v = parseCartPriceString(receipt.totals.total)
          return Number.isFinite(v) && v >= 0 ? v : undefined
        })()
      : undefined

  useEffect(() => {
    if (!hydrated) return
    if (!isThankYouEligible(orderCompleted, lastCompletedOrder)) return
    if (purchasePushAttempted.current) return
    if (!receipt || receipt.lines.length === 0) return
    if (!adsTransactionId || adsValueEuro == null) return

    purchasePushAttempted.current = true

    const taxValue = receipt.totals.totalTax != null
      ? parseCartPriceString(receipt.totals.totalTax)
      : undefined
    const shippingValue = receipt.totals.shippingTotal != null
      ? parseCartPriceString(receipt.totals.shippingTotal)
      : undefined

    // Pushes the GTM/GA4 purchase event once per order on the real thank-you page.
    pushPurchaseEvent({
      transactionId: adsTransactionId,
      value: adsValueEuro,
      currency: 'EUR',
      tax: Number.isFinite(taxValue) && (taxValue as number) >= 0 ? taxValue : undefined,
      shipping: Number.isFinite(shippingValue) && (shippingValue as number) >= 0 ? shippingValue : undefined,
      receipt,
    })
  }, [adsTransactionId, adsValueEuro, hydrated, lastCompletedOrder, orderCompleted, receipt])

  if (!hydrated) {
    return (
      <ContentShell className="py-12">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <p className="text-[#1F5CAB]/90">Lade...</p>
        </div>
      </ContentShell>
    )
  }

  if (!isThankYouEligible(orderCompleted, lastCompletedOrder)) {
    return (
      <ContentShell className="py-12">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <p className="text-[#1F5CAB]/90">Weiterleitung zum Warenkorb...</p>
        </div>
      </ContentShell>
    )
  }

  return (
    <ContentShell className="py-8 lg:py-12">
      <GoogleAdsPurchaseTracker transactionId={adsTransactionId} valueEuro={adsValueEuro} />
      <CheckoutSteps currentStep="order" />

      <div className="mx-auto mt-8 max-w-3xl space-y-8">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F0FB] text-[#1F5CAB]">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1F5CAB]">Bestellung erhalten</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#1F5CAB]/85">
            Vielen Dank. Deine Bestellung ist bei uns eingegangen. Eine Bestätigung senden wir an deine
            E-Mail-Adresse.
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-[#1F5CAB]">
            {orderLabel ? (
              <li className="flex justify-between gap-4 border-b border-[#DBE9F9] py-2">
                <span className="text-[#1F5CAB]/75">Bestellnr.</span>
                <span className="font-semibold tabular-nums">{orderLabel}</span>
              </li>
            ) : null}
            {formattedDate ? (
              <li className="flex justify-between gap-4 border-b border-[#DBE9F9] py-2">
                <span className="text-[#1F5CAB]/75">Datum</span>
                <span className="font-medium">{formattedDate}</span>
              </li>
            ) : null}
            {receipt ? (
              <li className="flex justify-between gap-4 border-b border-[#DBE9F9] py-2">
                <span className="text-[#1F5CAB]/75">Gesamt</span>
                <span className="font-semibold">{decodePriceDisplay(receipt.totals.total)}</span>
              </li>
            ) : null}
            {receipt?.email ? (
              <li className="flex justify-between gap-4 border-b border-[#DBE9F9] py-2">
                <span className="text-[#1F5CAB]/75">E-Mail</span>
                <span className="min-w-0 break-all font-medium">{receipt.email}</span>
              </li>
            ) : null}
            {receipt?.paymentMethodLabel ? (
              <li className="flex justify-between gap-4 py-2">
                <span className="text-[#1F5CAB]/75">Zahlung</span>
                <span className="text-right font-medium">{receipt.paymentMethodLabel}</span>
              </li>
            ) : null}
          </ul>

          {lastCompletedOrder?.status ? (
            <p className="mt-4 text-xs text-[#1F5CAB]/65">Status: {lastCompletedOrder.status}</p>
          ) : null}
        </div>

        {receipt && receipt.lines.length > 0 ? (
          <section
            className="rounded-2xl border border-[#DBE9F9] bg-white p-6 shadow-sm"
            aria-labelledby="thankyou-order-details"
          >
            <h2 id="thankyou-order-details" className="text-lg font-bold text-[#1F5CAB]">
              Bestelldetails
            </h2>
            <ul className="mt-4 space-y-4">
              {receipt.lines.map((item) => (
                <li
                  key={item.cartKey}
                  className="rounded-xl border border-[#DBE9F9] bg-[#F7FAFF]/60 p-4"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#DBE9F9]">
                      <Image
                        src={
                          item.imageSourceUrl
                            ? getAbsoluteImageUrl(item.imageSourceUrl)
                            : '/placeholder.png'
                        }
                        alt={item.imageTitle ?? item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1F5CAB]">{item.name}</p>
                      <p className="text-sm text-[#1F5CAB]/75">
                        × {item.qty} · {decodePriceDisplay(item.unitPriceDisplay)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#1F5CAB]">
                        {decodePriceDisplay(item.totalDisplay)}
                      </p>
                    </div>
                  </div>
                  {item.configurationSummary.length > 0 ? (
                    <dl className="mt-3 grid gap-1 rounded-lg bg-white/80 p-3 text-xs text-[#1F5CAB]/85">
                      {item.configurationSummary.map((entry) => (
                        <div key={`${item.cartKey}-${entry.label}`} className="flex justify-between gap-3">
                          <dt className="font-semibold text-[#1F5CAB]">{entry.label}</dt>
                          <dd className="text-right">{entry.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t border-[#DBE9F9] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#1F5CAB]/80">Zwischensumme</dt>
                <dd className="font-medium text-[#1F5CAB]">
                  {decodePriceDisplay(receipt.totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#1F5CAB]/80">Versand</dt>
                <dd className="font-medium text-[#1F5CAB]">
                  {parseCartPriceString(receipt.totals.shippingTotal) +
                    parseCartPriceString(receipt.totals.feeTotal) ===
                  0
                    ? 'Preis auf Anfrage'
                    : decodePriceDisplay(getEffectiveShippingTotal(receipt.totals))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#1F5CAB]/80">MwSt.</dt>
                <dd className="font-medium text-[#1F5CAB]">
                  {decodePriceDisplay(receipt.totals.totalTax)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[#DBE9F9] pt-3 text-base font-bold text-[#1F5CAB]">
                <dt>Gesamt</dt>
                <dd>{decodePriceDisplay(receipt.totals.total)}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {(receipt?.billingLines?.length ?? 0) > 0 ? (
          <section className="rounded-2xl border border-[#DBE9F9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1F5CAB]">Rechnungsadresse</h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-[#1F5CAB]/90">
              {receipt!.billingLines.map((line, i) => (
                <span key={`bill-${i}`} className="block">
                  {line}
                </span>
              ))}
            </address>
          </section>
        ) : null}

        {(receipt?.shippingLines?.length ?? 0) > 0 ? (
          <section className="rounded-2xl border border-[#DBE9F9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1F5CAB]">Lieferadresse</h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-[#1F5CAB]/90">
              {receipt!.shippingLines!.map((line, i) => (
                <span key={`ship-${i}`} className="block">
                  {line}
                </span>
              ))}
            </address>
          </section>
        ) : null}

        {showBankHint ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-left text-sm text-amber-950">
            <h2 className="font-semibold text-amber-950">Direkte Banküberweisung</h2>
            <p className="mt-2 leading-relaxed text-amber-900/90">
              Bitte überweise den Betrag unter Angabe der Bestellnummer. Die Bankverbindung findest du in der
              E-Mail-Bestätigung. Nach Zahlungseingang beginnen wir mit der Bearbeitung.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              reset()
              router.push('/shop')
            }}
            className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52]"
          >
            Weiter einkaufen
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#1F5CAB] bg-white px-6 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:bg-[#F7FAFF]"
          >
            Zur Startseite
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#DBE9F9] bg-white px-6 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#B9D4F3]"
          >
            Kontakt
          </Link>
        </div>

        <p className="text-center text-xs text-[#1F5CAB]/60">
          Bei Fragen zu deiner Bestellung:{' '}
          <Link href="/kontakt" className="font-medium text-[#1F5CAB] underline hover:no-underline">
            Kontakt
          </Link>
          {' · '}
          <Link href="/mein-konto" className="font-medium text-[#1F5CAB] underline hover:no-underline">
            Mein Konto
          </Link>
        </p>
      </div>
    </ContentShell>
  )
}
