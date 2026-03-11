import type { CartProduct } from '@/shared/types/cart'

const DEFAULT_TAX_RATE = 0.19

export function calcSubtotal(products: CartProduct[]): number {
  return products.reduce((sum, p) => sum + p.price * p.qty, 0)
}

export function calcTax(subtotal: number, taxRate: number = DEFAULT_TAX_RATE): number {
  return Math.round(subtotal * taxRate * 100) / 100
}

export function calcShipping(_products: CartProduct[]): number {
  return 0
}

export function calcTotal(
  subtotal: number,
  tax: number,
  shipping: number,
  discount: number = 0
): number {
  return Math.round((subtotal + tax + shipping - discount) * 100) / 100
}

export function formatPrice(value: number): string {
  if (value <= 0 || !Number.isFinite(value)) {
    return 'Preis auf Anfrage'
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}
