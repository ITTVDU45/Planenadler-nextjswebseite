'use client'

import { PayPalDirectButton } from './PayPalDirectButton'
import type { CheckoutFormShipping } from '../types/checkout.types'

interface CartItem {
  productId: number
  quantity: number
  extraData?: string
}

interface PayPalPanelProps {
  shippingData: CheckoutFormShipping
  cartItems: CartItem[]
  coupons: string[]
  onSuccess: (wooOrderId: string, captureId: string, orderStatus: string, orderKey?: string | null) => void
  onError: (message: string) => void
}

export function PayPalPanel({ shippingData, cartItems, coupons, onSuccess, onError }: PayPalPanelProps) {
  return (
    <div className="mt-4 rounded-xl border border-[#DBE9F9] bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-[#1F5CAB]">PayPal</h3>
      <p className="mb-4 text-sm text-[#1F5CAB]/90">
        Bezahle sicher und schnell direkt mit deinem PayPal-Konto.
      </p>
      <PayPalDirectButton
        shippingData={shippingData}
        cartItems={cartItems}
        coupons={coupons}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  )
}
