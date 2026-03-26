'use client'

import { useEffect } from 'react'
import { useCheckoutStore } from '../store/checkout.store'
import { PAYMENT_METHOD_IDS, type PaymentMethodId } from '../types/checkout.types'
import type { CheckoutGatewayOption } from '../lib/payment-gateways'

const ALL_PAYMENT_OPTIONS: CheckoutGatewayOption[] = [
  {
    id: PAYMENT_METHOD_IDS.CARD,
    label: 'Karte',
    description: 'VISA, Mastercard, AMEX',
    available: true,
    frontendReady: false,
    expressEligible: false,
    action: 'select',
    wcPaymentMethodAliases: [],
    helperText: 'Direkter Karten-Flow ist in Next.js noch nicht live.',
  },
  {
    id: PAYMENT_METHOD_IDS.PAYPAL,
    label: 'PayPal',
    available: true,
    frontendReady: true,
    expressEligible: true,
    action: 'redirect',
    wcPaymentMethodAliases: [],
  },
  {
    id: PAYMENT_METHOD_IDS.KLARNA,
    label: 'Klarna',
    available: true,
    frontendReady: true,
    expressEligible: true,
    action: 'redirect',
    wcPaymentMethodAliases: [],
  },
  {
    id: PAYMENT_METHOD_IDS.BANK,
    label: 'Direkte Bankueberweisung',
    available: true,
    frontendReady: true,
    expressEligible: false,
    action: 'select',
    wcPaymentMethodAliases: [],
  },
  {
    id: PAYMENT_METHOD_IDS.WALLET,
    label: 'Apple Pay / Google Pay',
    description: 'Nur mit echtem Wallet-Flow im Frontend',
    available: true,
    frontendReady: false,
    expressEligible: false,
    action: 'select',
    wcPaymentMethodAliases: [],
    helperText: 'Wallet wird erst aktiv, wenn der direkte Stripe/WooPayments-Flow angebunden ist.',
  },
]

interface PaymentMethodsProps {
  hideWallet?: boolean
  options?: CheckoutGatewayOption[]
  loading?: boolean
}

export function PaymentMethods({ hideWallet = false, options, loading = false }: PaymentMethodsProps = {}) {
  const selectedPayment = useCheckoutStore((state) => state.selectedPayment)
  const setSelectedPayment = useCheckoutStore((state) => state.setSelectedPayment)

  const resolvedOptions = (options ?? ALL_PAYMENT_OPTIONS).filter(
    (option) => option.available && (!hideWallet || option.id !== PAYMENT_METHOD_IDS.WALLET)
  )

  useEffect(() => {
    if (!resolvedOptions.length) return

    const selectedOption = resolvedOptions.find((option) => option.id === selectedPayment)
    if (selectedOption) return

    const fallbackOption = resolvedOptions.find((option) => option.frontendReady)
    if (fallbackOption && fallbackOption.id !== selectedPayment) {
      setSelectedPayment(fallbackOption.id)
    }
  }, [resolvedOptions, selectedPayment, setSelectedPayment])

  return (
    <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
      <h2 className="mb-4 text-lg font-bold text-[#1F5CAB]">Zahlungsart</h2>
      {loading ? (
        <div className="rounded-xl border border-[#DBE9F9] bg-white p-4 text-sm text-[#1F5CAB]/75">
          Verfuegbare Zahlungsarten werden geladen...
        </div>
      ) : null}
      <ul className="space-y-2" role="radiogroup" aria-label="Zahlungsart waehlen">
        {resolvedOptions.map((option) => (
          <li key={option.id}>
            <label
              className={`flex items-start gap-3 rounded-xl border-2 p-4 transition ${
                option.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
              } ${
                selectedPayment === option.id
                  ? 'border-[#1F5CAB] bg-white shadow-sm'
                  : 'border-[#DBE9F9] bg-white hover:border-[#B9D4F3]'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={selectedPayment === option.id}
                disabled={!option.available}
                onChange={() => setSelectedPayment(option.id)}
                className="mt-1 h-4 w-4 border-[#DBE9F9] text-[#1F5CAB] focus:ring-[#1F5CAB]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#1F5CAB]">{option.label}</span>
                  {option.expressEligible ? (
                    <span className="rounded-full bg-[#E7F0FB] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F5CAB]">
                      Express
                    </span>
                  ) : null}
                </div>
                {option.description ? (
                  <p className="mt-0.5 text-xs text-[#1F5CAB]/70">{option.description}</p>
                ) : null}
                {option.helperText ? (
                  <p className="mt-1 text-xs text-amber-700">{option.helperText}</p>
                ) : null}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
