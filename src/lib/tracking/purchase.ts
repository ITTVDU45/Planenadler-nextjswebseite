import type { OrderReceiptSnapshot } from '@/features/checkout/lib/build-order-receipt-snapshot'
import {
  normalizeTrackingCurrency,
  pushToDataLayerOnce,
  roundTrackingValue,
  type DataLayerEcommerceEvent,
} from '@/lib/tracking'

const DEFAULT_CURRENCY = 'EUR'

export interface PurchaseEventInput {
  transactionId: string
  value: number
  currency?: string
  receipt: OrderReceiptSnapshot
}

export interface PurchaseEcommerceItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

export interface PurchaseEcommercePayload {
  transaction_id: string
  value: number
  currency: string
  items: PurchaseEcommerceItem[]
}

export interface PurchaseDataLayerEvent {
  event: 'purchase'
  ecommerce: PurchaseEcommercePayload
}

function roundCurrency(value: number): number {
  return roundTrackingValue(value)
}

function buildItemId(line: OrderReceiptSnapshot['lines'][number]): string {
  if (Number.isFinite(line.productId) && line.productId > 0) {
    return String(line.productId)
  }

  const slug = line.slug?.trim()
  if (slug) return slug

  return line.cartKey
}

export function buildPurchaseEcommercePayload(input: PurchaseEventInput): PurchaseEcommercePayload | null {
  const transactionId = input.transactionId?.trim()
  if (!transactionId) return null
  if (!Number.isFinite(input.value) || input.value < 0) return null

  const items = input.receipt.lines
    .filter((line) => line.qty > 0)
    .map((line) => ({
      item_id: buildItemId(line),
      item_name: line.name,
      price: roundCurrency(Number.isFinite(line.unitPrice) ? line.unitPrice : 0),
      quantity: line.qty,
    }))
    .filter((line) => line.item_id && line.item_name && line.quantity > 0)

  if (items.length === 0) return null

  return {
    transaction_id: transactionId,
    value: roundCurrency(input.value),
    currency: normalizeTrackingCurrency(input.currency ?? DEFAULT_CURRENCY),
    items,
  }
}

export function pushPurchaseEvent(input: PurchaseEventInput): boolean {
  if (typeof window === 'undefined') return false

  const payload = buildPurchaseEcommercePayload(input)
  if (!payload) return false
  const event: DataLayerEcommerceEvent = {
    event: 'purchase',
    ecommerce: payload,
  }
  return pushToDataLayerOnce(`purchase_tracked_${payload.transaction_id}`, event)
}
