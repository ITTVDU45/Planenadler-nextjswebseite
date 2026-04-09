import type { OrderReceiptSnapshot } from '@/features/checkout/lib/build-order-receipt-snapshot'

const STORAGE_PREFIX = 'purchase_tracked_'
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
  return Math.round(value * 100) / 100
}

function normalizeCurrency(currency?: string): string {
  const normalized = currency?.trim().toUpperCase()
  return normalized || DEFAULT_CURRENCY
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
    currency: normalizeCurrency(input.currency),
    items,
  }
}

function getStorageKey(transactionId: string): string {
  return `${STORAGE_PREFIX}${transactionId}`
}

function hasTrackedPurchase(transactionId: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    return sessionStorage.getItem(getStorageKey(transactionId)) === '1'
  } catch {
    return false
  }
}

function markPurchaseTracked(transactionId: string): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.setItem(getStorageKey(transactionId), '1')
  } catch {
    /* ignore */
  }
}

export function pushPurchaseEvent(input: PurchaseEventInput): boolean {
  if (typeof window === 'undefined') return false

  const payload = buildPurchaseEcommercePayload(input)
  if (!payload) return false
  if (hasTrackedPurchase(payload.transaction_id)) return false

  window.dataLayer = window.dataLayer || []

  const event: PurchaseDataLayerEvent = {
    event: 'purchase',
    ecommerce: payload,
  }

  window.dataLayer.push(event)
  markPurchaseTracked(payload.transaction_id)
  return true
}
