'use client'

import { useRef } from 'react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import type { CheckoutFormShipping } from '../types/checkout.types'

interface CartItem {
  productId: number
  quantity: number
  extraData?: string
}

interface PayPalDirectButtonProps {
  shippingData: CheckoutFormShipping
  cartItems: CartItem[]
  coupons: string[]
  onSuccess: (wooOrderId: string, captureId: string, orderStatus: string, orderKey?: string | null) => void
  onError: (message: string) => void
}

export function PayPalDirectButton({
  shippingData,
  cartItems,
  coupons,
  onSuccess,
  onError,
}: PayPalDirectButtonProps) {
  const wooOrderIdRef = useRef<string | null>(null)
  const orderKeyRef = useRef<string | null>(null)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''

  const createOrder = async (): Promise<string> => {
    const billing = {
      firstName: shippingData.firstName,
      lastName: shippingData.lastName,
      email: shippingData.email,
      phone: shippingData.phone,
      address1: shippingData.address1,
      address2: shippingData.address2 ?? '',
      city: shippingData.city,
      postcode: shippingData.postcode,
      country: shippingData.country,
      state: shippingData.state ?? '',
    }

    const shipping = shippingData.shipToDifferentAddress
      ? {
          firstName: shippingData.shippingFirstName ?? shippingData.firstName,
          lastName: shippingData.shippingLastName ?? shippingData.lastName,
          address1: shippingData.shippingAddress1 ?? shippingData.address1,
          address2: shippingData.shippingAddress2 ?? '',
          city: shippingData.shippingCity ?? shippingData.city,
          postcode: shippingData.shippingPostcode ?? shippingData.postcode,
          country: shippingData.shippingCountry ?? shippingData.country,
          state: shippingData.shippingState ?? '',
        }
      : billing

    const res = await fetch('/api/checkout/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-order',
        items: cartItems,
        billing,
        shipping,
        coupons,
      }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      paypalOrderId?: string
      wooOrderId?: string
      orderKey?: string | null
      error?: string
    }

    if (!res.ok || !data.paypalOrderId) {
      const message = data.error ?? 'PayPal Order konnte nicht erstellt werden.'
      onError(message)
      throw new Error(message)
    }

    wooOrderIdRef.current = data.wooOrderId ?? null
    orderKeyRef.current = data.orderKey ?? null
    return data.paypalOrderId
  }

  const onApprove = async (data: { orderID: string }) => {
    const wooOrderId = wooOrderIdRef.current

    if (!wooOrderId) {
      onError('WooCommerce Bestellnummer fehlt. Bitte versuche es erneut.')
      return
    }

    const res = await fetch('/api/checkout/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'capture-order',
        paypalOrderId: data.orderID,
        wooOrderId,
      }),
    })

    const result = (await res.json().catch(() => ({}))) as {
      captureId?: string
      wooOrderId?: string
      orderStatus?: string
      error?: string
    }

    if (!res.ok || !result.captureId) {
      onError(result.error ?? 'PayPal Capture fehlgeschlagen.')
      return
    }

    onSuccess(
      result.wooOrderId ?? wooOrderId,
      result.captureId,
      result.orderStatus ?? 'processing',
      orderKeyRef.current,
    )
  }

  if (!clientId) {
    return (
      <p className="text-sm text-red-600">
        NEXT_PUBLIC_PAYPAL_CLIENT_ID fehlt in der Konfiguration.
      </p>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'EUR',
        locale: 'de_DE',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 45 }}
        forceReRender={[cartItems.length, coupons.join(',')]}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => {
          onError(err instanceof Error ? err.message : 'PayPal Fehler aufgetreten. Bitte erneut versuchen.')
        }}
      />
    </PayPalScriptProvider>
  )
}
