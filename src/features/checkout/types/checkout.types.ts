/**
 * Checkout feature types: steps, shipping, payment, form.
 */

import type { CartProduct } from '@/shared/types/cart'

export type CheckoutStepId = 'cart' | 'shipping' | 'payment' | 'order'

export const SHIPPING_METHOD_IDS = {
  FREE: 'free_shipping',
  EXPRESS: 'express',
  PICKUP: 'pickup',
} as const

export type ShippingMethodId = (typeof SHIPPING_METHOD_IDS)[keyof typeof SHIPPING_METHOD_IDS]

export interface ShippingOption {
  id: ShippingMethodId
  label: string
  price: number
  deliveryDays: string
}

export const PAYMENT_METHOD_IDS = {
  CARD: 'card',
  BANK: 'bacs',
  PAYPAL: 'paypal',
  KLARNA: 'klarna',
  WALLET: 'wallet',
} as const

export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[keyof typeof PAYMENT_METHOD_IDS]

export interface PaymentOption {
  id: PaymentMethodId
  label: string
  description?: string
  icon?: string
}

export interface CheckoutFormShipping {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2?: string
  postcode: string
  city: string
  country: string
  state?: string
  shipToDifferentAddress: boolean
  shippingFirstName?: string
  shippingLastName?: string
  shippingAddress1?: string
  shippingAddress2?: string
  shippingPostcode?: string
  shippingCity?: string
  shippingCountry?: string
  shippingState?: string
  shippingMethod: ShippingMethodId
}

export interface CheckoutFormPayment {
  paymentMethod: PaymentMethodId
}

export interface CheckoutFormValues extends CheckoutFormShipping, CheckoutFormPayment {}

export interface CheckoutCalculationsInput {
  products: CartProduct[]
  shippingMethodId: ShippingMethodId
  discountAmount?: number
  taxRate?: number
}

export interface CheckoutTotals {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
}
