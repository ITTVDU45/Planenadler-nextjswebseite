import type { Cart, CartProduct } from '@/shared/types/cart'

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

const DEFAULT_CURRENCY = 'EUR'

export type EcommerceEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'

export interface EcommerceItemInput {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
}

export interface EcommercePayload {
  transaction_id?: string
  value?: number
  currency?: string
  shipping_tier?: string
  payment_type?: string
  items?: EcommerceItemInput[]
}

export interface DataLayerEcommerceEvent {
  event: EcommerceEventName
  ecommerce: EcommercePayload
}

export function pushToDataLayer(data: DataLayerEcommerceEvent): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

export function roundTrackingValue(value: number): number {
  return Math.round(value * 100) / 100
}

export function normalizeTrackingCurrency(currency?: string): string {
  const normalized = currency?.trim().toUpperCase()
  return normalized || DEFAULT_CURRENCY
}

export function buildCartItemId(item: Pick<CartProduct, 'productId' | 'slug' | 'cartKey'>): string {
  if (Number.isFinite(item.productId) && item.productId > 0) {
    return String(item.productId)
  }

  const slug = item.slug?.trim()
  if (slug) return slug

  return item.cartKey
}

export function mapCartProductToTrackingItem(item: CartProduct): EcommerceItemInput {
  return {
    item_id: buildCartItemId(item),
    item_name: item.name,
    price: roundTrackingValue(Number.isFinite(item.price) ? item.price : 0),
    quantity: item.qty,
  }
}

export function mapCartToTrackingItems(cart: Cart | null | undefined): EcommerceItemInput[] {
  return (cart?.products ?? [])
    .filter((item) => item.qty > 0)
    .map(mapCartProductToTrackingItem)
}

export function buildCartSignature(cart: Cart | null | undefined): string {
  const parts = (cart?.products ?? [])
    .map((item) => `${buildCartItemId(item)}:${item.qty}:${roundTrackingValue(item.price)}`)
    .sort()

  return parts.join('|')
}

export function hasTrackedDataLayerEvent(key: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

export function markTrackedDataLayerEvent(key: string): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* ignore */
  }
}

export function pushToDataLayerOnce(key: string, data: DataLayerEcommerceEvent): boolean {
  if (hasTrackedDataLayerEvent(key)) return false
  pushToDataLayer(data)
  markTrackedDataLayerEvent(key)
  return true
}
