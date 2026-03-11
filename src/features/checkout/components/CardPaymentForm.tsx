'use client'

/**
 * Card payment: demo placeholder fields (MVP).
 * Replace with Stripe Payment Element for PCI-compliant card capture.
 */

export function CardPaymentForm() {
  return (
    <div className="mt-4 rounded-xl border border-[#DBE9F9] bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-[#1F5CAB]">Kartenzahlung</h3>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Kartenzahlung ist in diesem Checkout aktuell noch nicht live geschaltet.
      </div>
      <p className="mt-3 text-xs text-[#1F5CAB]/70">
        Bitte nutzen Sie bis zur Aktivierung Klarna, PayPal oder Banküberweisung.
      </p>
    </div>
  )
}
