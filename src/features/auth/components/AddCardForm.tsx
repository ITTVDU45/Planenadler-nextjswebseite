'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Link from 'next/link'

let stripePromise: ReturnType<typeof loadStripe> | null = null
function getStripePromise(publishableKey: string) {
  if (!stripePromise) stripePromise = loadStripe(publishableKey)
  return stripePromise
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1F5CAB',
      '::placeholder': { color: '#1F5CAB80' },
      iconColor: '#1F5CAB',
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
}

function AddCardFormInner({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setLoading(true)
    const card = elements.getElement(CardElement)
    if (!card) {
      setLoading(false)
      return
    }
    const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    })
    if (createError) {
      setError(createError.message ?? 'Karte konnte nicht erstellt werden.')
      setLoading(false)
      return
    }
    if (!paymentMethod?.id) {
      setError('Keine Zahlungsmethode erhalten.')
      setLoading(false)
      return
    }
    const res = await fetch('/api/mein-konto/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        gateway: 'stripe',
        paymentMethodId: paymentMethod.id,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Speichern fehlgeschlagen.')
      setLoading(false)
      return
    }
    onSuccess()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border-2 border-[#DBE9F9] bg-white p-4">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="rounded-full bg-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a4d8c] disabled:opacity-60"
        >
          {loading ? 'Wird gespeichert…' : 'Zahlungsmethode hinzufügen'}
        </button>
        <Link
          href="/mein-konto/zahlungsmethoden"
          className="rounded-full border-2 border-[#1F5CAB] px-5 py-2.5 text-sm font-semibold text-[#1F5CAB] hover:bg-[#DBE9F9]"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  )
}

export function AddCardForm({ onSuccess }: { onSuccess: () => void }) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <p className="font-medium">Stripe nicht konfiguriert</p>
        <p className="mt-1 text-sm">
          Bitte setzen Sie <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in der
          Umgebung.
        </p>
      </div>
    )
  }
  const stripePromise = getStripePromise(publishableKey)
  return (
    <Elements stripe={stripePromise}>
      <AddCardFormInner onSuccess={onSuccess} />
    </Elements>
  )
}
