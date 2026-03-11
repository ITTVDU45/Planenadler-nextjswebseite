/**
 * Checkout business logic: subtotal, shipping, tax, discount, total.
 * No UI logic; pure calculations.
 */

import type { CartProduct } from '@/shared/types/cart'
import type { ShippingMethodId } from '../types/checkout.types'

const DEFAULT_TAX_RATE = 0.19

const SHIPPING_PRICES: Record<ShippingMethodId, number> = {
  free_shipping: 0,
  express: 9,
  pickup: 0,
}

export function calcSubtotal(products: CartProduct[]): number {
  return products.reduce((sum, p) => sum + p.price * p.qty, 0)
}

export function calcShipping(
  _products: CartProduct[],
  shippingMethodId: ShippingMethodId
): number {
  return SHIPPING_PRICES[shippingMethodId] ?? 0
}

export function calcTax(subtotal: number, taxRate: number = DEFAULT_TAX_RATE): number {
  return Math.round(subtotal * taxRate * 100) / 100
}

export function calcTotal(
  subtotal: number,
  tax: number,
  shipping: number,
  discount: number = 0
): number {
  return Math.round((subtotal + tax + shipping - discount) * 100) / 100
}

export function getCheckoutTotals(
  products: CartProduct[],
  shippingMethodId: ShippingMethodId,
  discountAmount: number = 0,
  taxRate: number = DEFAULT_TAX_RATE
): {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
} {
  const subtotal = calcSubtotal(products)
  const shipping = calcShipping(products, shippingMethodId)
  const tax = calcTax(subtotal, taxRate)
  const discount = Math.min(discountAmount, subtotal + shipping)
  const total = calcTotal(subtotal, tax, shipping, discount)
  return { subtotal, shipping, tax, discount, total }
}
