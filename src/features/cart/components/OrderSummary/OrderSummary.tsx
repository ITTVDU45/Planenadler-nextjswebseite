'use client'

import Link from 'next/link'
import { formatPrice } from '../../services/cartCalculations'

interface OrderSummaryProps {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

const CHECKOUT_PATH = '/checkout/shipping'
const SHOP_PATH = '/shop'

export function OrderSummary({
  subtotal,
  tax,
  shipping,
  total,
}: OrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6 shadow-[0_8px_24px_rgba(31,92,171,0.06)] lg:sticky lg:top-24">
      <h2 className="mb-4 text-lg font-bold text-[#1F5CAB]">
        Bestellübersicht
      </h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-[#1F5CAB]/80">Zwischensumme</dt>
          <dd className="font-medium text-[#1F5CAB]">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#1F5CAB]/80">Versand</dt>
          <dd className="font-medium text-[#1F5CAB]">
            {shipping === 0
              ? 'wird im Checkout berechnet'
              : formatPrice(shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#1F5CAB]/80">MwSt.</dt>
          <dd className="font-medium text-[#1F5CAB]">{formatPrice(tax)}</dd>
        </div>
      </dl>
      <div className="my-4 border-t border-[#DBE9F9] pt-4">
        <div className="flex justify-between text-base font-bold text-[#1F5CAB]">
          <dt>Gesamtbetrag</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href={CHECKOUT_PATH}
          className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
        >
          Zur Kasse
        </Link>
        <Link
          href={SHOP_PATH}
          className="inline-flex items-center justify-center rounded-full border-2 border-[#DBE9F9] bg-white px-6 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#B9D4F3] hover:bg-[#F7FAFF] focus:outline-none focus:ring-2 focus:ring-[#DBE9F9] focus:ring-offset-2"
        >
          Weiter einkaufen
        </Link>
      </div>
    </div>
  )
}
