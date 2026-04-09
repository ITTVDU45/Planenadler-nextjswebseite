'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCheckoutStore, type LastCompletedOrderSnapshot } from '../store/checkout.store'
import { CheckoutSteps } from './CheckoutSteps'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { PAYMENT_METHOD_IDS } from '../types/checkout.types'

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

export function CheckoutConfirmationContent() {
  const router = useRouter()
  const orderCompleted = useCheckoutStore((s) => s.orderCompleted)
  const lastCompletedOrder = useCheckoutStore((s) => s.lastCompletedOrder)
  const selectedPayment = useCheckoutStore((s) => s.selectedPayment)
  const reset = useCheckoutStore((s) => s.reset)

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const api = useCheckoutStore.persist
    if (!api) {
      setHydrated(true)
      return
    }
    if (api.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsub = api.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

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
        ? `#${lastCompletedOrder.databaseId}`
        : null

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
      <CheckoutSteps currentStep="order" />

      <div className="mx-auto mt-8 max-w-2xl space-y-6">
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
          <h1 className="text-2xl font-bold text-[#1F5CAB]">Vielen Dank für Ihre Bestellung</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#1F5CAB]/85">
            Ihre Bestellung ist bei uns eingegangen. Sie erhalten in Kürze eine Bestätigung per E-Mail an die
            von Ihnen angegebene Adresse.
          </p>
          {orderLabel ? (
            <p className="mt-4 text-base font-semibold text-[#1F5CAB]">
              Bestellnummer: <span className="tabular-nums">{orderLabel}</span>
            </p>
          ) : null}
          {lastCompletedOrder?.status ? (
            <p className="mt-1 text-xs text-[#1F5CAB]/65">Status: {lastCompletedOrder.status}</p>
          ) : null}
        </div>

        {showBankHint ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-left text-sm text-amber-950">
            <h2 className="font-semibold text-amber-950">Direkte Banküberweisung</h2>
            <p className="mt-2 leading-relaxed text-amber-900/90">
              Bitte überweisen Sie den Betrag unter Angabe der Bestellnummer. Die Bankverbindung entnehmen Sie
              der E-Mail-Bestätigung oder Ihrer Rechnung. Nach Zahlungseingang beginnen wir mit der Bearbeitung.
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
          Bei Fragen zu Ihrer Bestellung erreichen Sie uns unter{' '}
          <Link href="/kontakt" className="font-medium text-[#1F5CAB] underline hover:no-underline">
            Kontakt
          </Link>{' '}
          oder in Ihrem{' '}
          <Link href="/mein-konto" className="font-medium text-[#1F5CAB] underline hover:no-underline">
            Kundenkonto
          </Link>
          .
        </p>
      </div>
    </ContentShell>
  )
}
