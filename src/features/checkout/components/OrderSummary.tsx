'use client'

import Image from 'next/image'
import { useCartStore } from '@/shared/lib/cartStore'
import {
  decodePriceDisplay,
  getEffectiveShippingTotal,
  getAbsoluteImageUrl,
  parseCartPriceString,
} from '@/shared/lib/functions'

export function CheckoutOrderSummary() {
  const cart = useCartStore((state) => state.cart)
  const products = cart?.products ?? []
  const totals = cart?.totals ?? {
    subtotal: '0,00 €',
    subtotalTax: '0,00 €',
    shippingTax: '0,00 €',
    shippingTotal: '0,00 €',
    total: '0,00 €',
    totalTax: '0,00 €',
    feeTax: '0,00 €',
    feeTotal: '0,00 €',
    discountTax: '0,00 €',
    discountTotal: '0,00 €',
  }
  const appliedCoupons = cart?.appliedCoupons ?? []
  const shippingValue = parseCartPriceString(totals.shippingTotal) + parseCartPriceString(totals.feeTotal)
  const showFreeShippingAmount = shippingValue === 0 && parseCartPriceString(totals.discountTotal) > 0

  return (
    <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6 shadow-[0_8px_24px_rgba(31,92,171,0.06)]">
      <h2 className="mb-4 text-lg font-bold text-[#1F5CAB]">Ihre Bestellung</h2>
      {products.length > 0 ? (
        <>
          <ul className="mb-4 space-y-3">
            {products.map((item) => (
              <li
                key={item.cartKey}
                className="rounded-lg border border-[#DBE9F9] bg-white p-3"
              >
                <div className="flex gap-3">
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
                      {item.qty} x {decodePriceDisplay(item.unitPriceDisplay)}
                    </p>
                  </div>
                </div>
                {item.configurationSummary.length > 0 ? (
                  <dl className="mt-3 grid gap-1 rounded-lg bg-[#F7FAFF] p-3 text-xs text-[#1F5CAB]/85">
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

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#1F5CAB]/80">Zwischensumme</dt>
              <dd className="font-medium text-[#1F5CAB]">{decodePriceDisplay(totals.subtotal)}</dd>
            </div>
            {parseCartPriceString(totals.discountTotal) > 0 ? (
              <div className="flex justify-between">
                <dt className="text-[#1F5CAB]/80">
                  Rabatt{appliedCoupons.length > 0 ? ` (${appliedCoupons.map((coupon) => coupon.code).join(', ')})` : ''}
                </dt>
                <dd className="font-medium text-[#1F5CAB]">-{decodePriceDisplay(totals.discountTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-[#1F5CAB]/80">Versand</dt>
              <dd className="font-medium text-[#1F5CAB]">
                {showFreeShippingAmount
                  ? '0,00 €'
                  : shippingValue === 0
                  ? 'Preis auf Anfrage'
                  : decodePriceDisplay(getEffectiveShippingTotal(totals))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#1F5CAB]/80">MwSt.</dt>
              <dd className="font-medium text-[#1F5CAB]">{decodePriceDisplay(totals.totalTax)}</dd>
            </div>
          </dl>
          <div className="my-4 border-t border-[#DBE9F9] pt-4">
            <div className="flex justify-between text-base font-bold text-[#1F5CAB]">
              <dt>Gesamtbetrag</dt>
              <dd>{decodePriceDisplay(totals.total)}</dd>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#1F5CAB]/70">Sichere Zahlung</p>
        </>
      ) : (
        <p className="text-sm text-[#1F5CAB]/80">Ihr Warenkorb ist leer.</p>
      )}
    </div>
  )
}
