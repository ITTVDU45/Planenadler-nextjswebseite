import type { Cart, CartTotals } from '@/shared/types/cart'
import type { CheckoutFormShipping } from '../types/checkout.types'

export interface OrderReceiptLineSnapshot {
  cartKey: string
  productId: number
  slug?: string
  name: string
  qty: number
  unitPrice: number
  unitPriceDisplay: string
  totalDisplay: string
  imageSourceUrl?: string
  imageTitle?: string
  variant?: string
  configurationSummary: Array<{ label: string; value: string }>
}

export interface OrderReceiptSnapshot {
  lines: OrderReceiptLineSnapshot[]
  totals: CartTotals
  email: string
  billingLines: string[]
  shippingLines?: string[]
  paymentMethodLabel: string
}

function compactLines(lines: (string | undefined | null | false)[]): string[] {
  return lines.filter((l): l is string => Boolean(l && String(l).trim()))
}

export function buildOrderReceiptSnapshot(
  cart: Cart,
  shipping: CheckoutFormShipping,
  paymentMethodLabel: string,
): OrderReceiptSnapshot {
  const lines: OrderReceiptLineSnapshot[] = cart.products.map((p) => ({
    cartKey: p.cartKey,
    productId: p.productId,
    slug: p.slug,
    name: p.name,
    qty: p.qty,
    unitPrice: p.price,
    unitPriceDisplay: p.unitPriceDisplay,
    totalDisplay: p.totalDisplay,
    imageSourceUrl: p.image?.sourceUrl,
    imageTitle: p.image?.title,
    variant: p.variant,
    configurationSummary: p.configurationSummary.map((c) => ({ label: c.label, value: c.value })),
  }))

  const billingLines = compactLines([
    `${shipping.firstName} ${shipping.lastName}`.trim(),
    shipping.address1,
    shipping.address2,
    `${shipping.postcode} ${shipping.city}`.trim(),
    shipping.country,
    shipping.phone ? `Tel.: ${shipping.phone}` : '',
  ])

  let shippingLines: string[] | undefined
  if (shipping.shipToDifferentAddress) {
    shippingLines = compactLines([
      `${shipping.shippingFirstName ?? ''} ${shipping.shippingLastName ?? ''}`.trim(),
      shipping.shippingAddress1,
      shipping.shippingAddress2,
      `${shipping.shippingPostcode ?? ''} ${shipping.shippingCity ?? ''}`.trim(),
      shipping.shippingCountry,
    ])
  }

  return {
    lines,
    totals: { ...cart.totals },
    email: shipping.email,
    billingLines,
    shippingLines,
    paymentMethodLabel,
  }
}
