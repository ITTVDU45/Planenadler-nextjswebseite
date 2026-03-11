'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AddCardForm } from './AddCardForm'
import {
  getPaymentMethodCallbackUrl,
} from '@/features/auth/lib/paymentMethodsUrl'

type View = 'list' | 'card'

type ProviderRedirectResponse = {
  url?: string
  error?: string
  code?: string
  wpAddPaymentUrl?: string
}

type ProviderRedirectResult =
  | { ok: true }
  | { ok: false; message: string }

async function redirectToProviderPayment(
  provider: 'klarna' | 'paypal',
  returnUrl?: string
): Promise<ProviderRedirectResult> {
  const params = new URLSearchParams({ provider })
  if (returnUrl) params.set('returnUrl', returnUrl)

  const res = await fetch(`/api/mein-konto/payment-methods/redirect?${params.toString()}`, {
    credentials: 'include',
  })
  const data = (await res.json()) as ProviderRedirectResponse
  if (!res.ok) {
    if (data.code === 'wp_login_required' && data.wpAddPaymentUrl) {
      return {
        ok: false,
        message:
          'WP-Login-Cookie fehlt auf dieser Domain. Lokal ist direkter Provider-Redirect ohne geteilte Shop-Session nicht möglich.',
      }
    }
    if (data.code === 'invalid_provider_redirect') {
      return {
        ok: false,
        message:
          'Redirect-Ziel vom Backend ist ungueltig (nicht Klarna/PayPal). Bitte Provider-Plugin/Endpoint in WordPress pruefen.',
      }
    }
    return {
      ok: false,
      message: data.error || 'Direkte Weiterleitung fehlgeschlagen.',
    }
  }
  if (data.url) {
    window.location.href = data.url
    return { ok: true }
  }
  return {
    ok: false,
    message: 'Keine externe Weiterleitungs-URL vom Provider erhalten.',
  }
}

export function AddPaymentMethodContent() {
  const [view, setView] = useState<View>('list')
  const [cardSuccess, setCardSuccess] = useState(false)
  const [redirecting, setRedirecting] = useState<'klarna' | 'paypal' | null>(null)
  const [redirectError, setRedirectError] = useState<string | null>(null)

  const handleCardSuccess = () => setCardSuccess(true)

  const successUrl = typeof window !== 'undefined' ? getPaymentMethodCallbackUrl('klarna', 'success') : ''
  const paypalSuccessUrl = typeof window !== 'undefined' ? getPaymentMethodCallbackUrl('paypal', 'success') : ''

  const handleKlarnaClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setRedirectError(null)
    setRedirecting('klarna')
    const result = await redirectToProviderPayment('klarna', successUrl)
    if (!result.ok) {
      setRedirecting(null)
      setRedirectError(result.message)
    }
  }

  const handlePayPalClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setRedirectError(null)
    setRedirecting('paypal')
    const result = await redirectToProviderPayment('paypal', paypalSuccessUrl)
    if (!result.ok) {
      setRedirecting(null)
      setRedirectError(result.message)
    }
  }

  if (cardSuccess) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800">
        <p className="font-semibold">Zahlungsmethode wurde gespeichert.</p>
        <p className="mt-1 text-sm">Sie können die Karte bei zukünftigen Bestellungen verwenden.</p>
        <Link
          href="/mein-konto/zahlungsmethoden"
          className="mt-4 inline-block rounded-full bg-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a4d8c]"
        >
          Zurück zu Zahlungsmethoden
        </Link>
      </div>
    )
  }

  if (view === 'card') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setView('list')}
          className="text-[#1F5CAB] hover:underline"
        >
          ← Zurück zur Auswahl
        </button>
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
          <h2 className="text-lg font-semibold text-[#1F5CAB]">Karte / Kreditkarte</h2>
          <p className="mt-1 text-sm text-[#1F5CAB]/80">VISA, Mastercard, AMEX – Angaben werden sicher von Stripe verarbeitet.</p>
          <div className="mt-4">
            <AddCardForm onSuccess={handleCardSuccess} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {redirectError && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800" role="alert">
          {redirectError}
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li>
        <div className="flex h-full flex-col rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
          <h2 className="text-lg font-semibold text-[#1F5CAB]">Karte / Kreditkarte</h2>
          <p className="mt-1 flex-1 text-sm text-[#1F5CAB]/80">VISA, Mastercard, AMEX</p>
          <button
            type="button"
            onClick={() => setView('card')}
            className="mt-4 inline-flex w-fit rounded-full bg-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a4d8c] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
          >
            Hinzufügen
          </button>
        </div>
      </li>
      <li>
        <div className="flex h-full flex-col rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
          <h2 className="text-lg font-semibold text-[#1F5CAB]">Klarna</h2>
          <p className="mt-1 flex-1 text-sm text-[#1F5CAB]/80">Rechnung, Ratenzahlung oder Sofortüberweisung</p>
          <button
            type="button"
            onClick={handleKlarnaClick}
            disabled={!!redirecting}
            className="mt-4 inline-flex w-fit rounded-full bg-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a4d8c] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2 disabled:opacity-70"
          >
            {redirecting === 'klarna' ? 'Weiterleitung …' : 'Hinzufügen'}
          </button>
        </div>
      </li>
      <li>
        <div className="flex h-full flex-col rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
          <h2 className="text-lg font-semibold text-[#1F5CAB]">PayPal</h2>
          <p className="mt-1 flex-1 text-sm text-[#1F5CAB]/80">Mit PayPal-Konto bezahlen</p>
          <button
            type="button"
            onClick={handlePayPalClick}
            disabled={!!redirecting}
            className="mt-4 inline-flex w-fit rounded-full bg-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a4d8c] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2 disabled:opacity-70"
          >
            {redirecting === 'paypal' ? 'Weiterleitung …' : 'Hinzufügen'}
          </button>
        </div>
      </li>
    </ul>
  </div>
  )
}
