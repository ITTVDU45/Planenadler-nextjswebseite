'use client'

import { useCheckoutStore } from '../store/checkout.store'
import { PAYMENT_METHOD_IDS, type PaymentMethodId } from '../types/checkout.types'

const ALL_PAYMENT_OPTIONS: { id: PaymentMethodId; label: string; description?: string }[] = [
  { id: PAYMENT_METHOD_IDS.CARD, label: 'Karte', description: 'VISA, Mastercard, AMEX' },
  { id: PAYMENT_METHOD_IDS.PAYPAL, label: 'PayPal' },
  { id: PAYMENT_METHOD_IDS.KLARNA, label: 'Klarna' },
  { id: PAYMENT_METHOD_IDS.BANK, label: 'Direkte Banküberweisung' },
  { id: PAYMENT_METHOD_IDS.WALLET, label: 'Apple Pay / Google Pay', description: 'Demnächst' },
]

interface PaymentMethodsProps {
  /** Hide wallet option (e.g. on dedicated payment page) */
  hideWallet?: boolean
}

export function PaymentMethods({ hideWallet = false }: PaymentMethodsProps = {}) {
  const selectedPayment = useCheckoutStore((s) => s.selectedPayment)
  const setSelectedPayment = useCheckoutStore((s) => s.setSelectedPayment)
  const options = hideWallet
    ? ALL_PAYMENT_OPTIONS.filter((o) => o.id !== PAYMENT_METHOD_IDS.WALLET)
    : ALL_PAYMENT_OPTIONS

  return (
    <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
      <h2 className="mb-4 text-lg font-bold text-[#1F5CAB]">Zahlungsart</h2>
      <ul className="space-y-2" role="radiogroup" aria-label="Zahlungsart wählen">
        {options.map((opt) => (
          <li key={opt.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                selectedPayment === opt.id
                  ? 'border-[#1F5CAB] bg-white shadow-sm'
                  : 'border-[#DBE9F9] bg-white hover:border-[#B9D4F3]'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.id}
                checked={selectedPayment === opt.id}
                onChange={() => setSelectedPayment(opt.id)}
                className="mt-1 h-4 w-4 border-[#DBE9F9] text-[#1F5CAB] focus:ring-[#1F5CAB]"
              />
              <div>
                <span className="font-medium text-[#1F5CAB]">{opt.label}</span>
                {opt.description ? (
                  <p className="mt-0.5 text-xs text-[#1F5CAB]/70">{opt.description}</p>
                ) : null}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
