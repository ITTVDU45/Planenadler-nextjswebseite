'use client'

import { SHIPPING_METHOD_IDS, type ShippingMethodId } from '../types/checkout.types'
import { formatPrice } from '@/features/cart/services/cartCalculations'

const OPTIONS: { id: ShippingMethodId; label: string; price: number; deliveryDays: string }[] = [
  { id: SHIPPING_METHOD_IDS.FREE, label: 'Standardversand', price: 0, deliveryDays: '7–14 Werktage' },
  { id: SHIPPING_METHOD_IDS.EXPRESS, label: 'Express', price: 9, deliveryDays: '1–3 Werktage' },
  { id: SHIPPING_METHOD_IDS.PICKUP, label: 'Abholung', price: 0, deliveryDays: 'Nach Vereinbarung' },
]

interface ShippingMethodProps {
  value: ShippingMethodId
  onChange: (id: ShippingMethodId) => void
  error?: string
}

export function ShippingMethod({ value, onChange, error }: ShippingMethodProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-[#1F5CAB]">Versandart</h3>
      <ul className="space-y-2" role="radiogroup" aria-label="Versandart wählen" aria-invalid={!!error}>
        {OPTIONS.map((opt) => (
          <li key={opt.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                value === opt.id
                  ? 'border-[#1F5CAB] bg-white shadow-sm'
                  : 'border-[#DBE9F9] bg-white hover:border-[#B9D4F3]'
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
                className="mt-1 h-4 w-4 border-[#DBE9F9] text-[#1F5CAB] focus:ring-[#1F5CAB]"
              />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-[#1F5CAB]">{opt.label}</span>
                <p className="mt-0.5 text-xs text-[#1F5CAB]/70">{opt.deliveryDays}</p>
                <p className="mt-1 text-sm font-medium text-[#1F5CAB]">
                  {formatPrice(opt.price)}
                </p>
              </div>
            </label>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-1.5 text-sm text-red-600" role="alert">{error}</p> : null}
    </div>
  )
}
