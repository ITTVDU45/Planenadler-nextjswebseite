'use client'

import { useState } from 'react'
import { useCartStore } from '@/shared/lib/cartStore'
import { useCheckoutStore } from '../store/checkout.store'
import { getCheckoutTotals } from '../services/checkout.calculations'
import { formatPrice } from '@/features/cart/services/cartCalculations'
import Image from 'next/image'
import { getAbsoluteImageUrl } from '@/shared/lib/functions'

/** Demo coupon: no backend yet; accept DEMO5 for 5 EUR off (optional). */
function getDiscountForCoupon(code: string): number {
  const c = code.trim().toUpperCase()
  if (c === 'DEMO5') return 5
  return 0
}

export function CheckoutOrderSummary() {
  const cart = useCartStore((s) => s.cart)
  const selectedShipping = useCheckoutStore((s) => s.selectedShipping)
  const products = cart?.products ?? []
  const [couponInput, setCouponInput] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState<string | null>(null)

  const totals = getCheckoutTotals(products, selectedShipping, appliedDiscount)

  const handleApplyCoupon = () => {
    setCouponMessage(null)
    const discount = getDiscountForCoupon(couponInput)
    if (discount > 0) {
      setAppliedDiscount(discount)
      setCouponMessage('Gutschein angewendet.')
    } else {
      setAppliedDiscount(0)
      setCouponMessage(couponInput.trim() ? 'Ungültiger Gutschein.' : null)
    }
  }

  return (
    <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6 shadow-[0_8px_24px_rgba(31,92,171,0.06)]">
      <h2 className="mb-4 text-lg font-bold text-[#1F5CAB]">Ihre Bestellung</h2>
      {products.length > 0 ? (
        <>
          <ul className="mb-4 space-y-3">
            {products.map((item) => (
              <li
                key={item.cartKey}
                className="flex gap-3 rounded-lg border border-[#DBE9F9] bg-white p-2"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#DBE9F9]">
                  <Image
                    src={
                      item.image?.sourceUrl
                        ? getAbsoluteImageUrl(item.image.sourceUrl)
                        : '/placeholder.png'
                    }
                    alt={item.image?.title ?? item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1F5CAB]">{item.name}</p>
                  <p className="text-xs text-[#1F5CAB]/70">
                    {item.qty} &times; {formatPrice(item.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Gutscheincode"
              className="min-w-0 flex-1 rounded-lg border border-[#DBE9F9] bg-white px-3 py-2 text-sm text-[#1F5CAB] placeholder:text-[#1F5CAB]/50 focus:border-[#1F5CAB] focus:outline-none focus:ring-1 focus:ring-[#1F5CAB]"
              aria-label="Gutscheincode"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="shrink-0 rounded-lg border border-[#1F5CAB] bg-[#1F5CAB] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
            >
              Anwenden
            </button>
          </div>
          {couponMessage ? (
            <p className={`mb-3 text-xs ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
              {couponMessage}
            </p>
          ) : null}
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#1F5CAB]/80">Zwischensumme</dt>
              <dd className="font-medium text-[#1F5CAB]">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#1F5CAB]/80">Versand</dt>
              <dd className="font-medium text-[#1F5CAB]">{formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#1F5CAB]/80">MwSt.</dt>
              <dd className="font-medium text-[#1F5CAB]">{formatPrice(totals.tax)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-[#1F5CAB]/80">Rabatt</dt>
                <dd className="font-medium text-emerald-600">-{formatPrice(totals.discount)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="my-4 border-t border-[#DBE9F9] pt-4">
            <div className="flex justify-between text-base font-bold text-[#1F5CAB]">
              <dt>Gesamtbetrag</dt>
              <dd>{formatPrice(totals.total)}</dd>
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[#1F5CAB]/70">
            <span aria-hidden>🔒</span> Sichere Zahlung
          </p>
        </>
      ) : (
        <p className="text-sm text-[#1F5CAB]/80">Ihr Warenkorb ist leer.</p>
      )}
    </div>
  )
}
