'use client'

import { useCheckoutStore } from '../store/checkout.store'
import { ShippingForm } from './ShippingForm'
import type { CheckoutShippingInput } from '../lib/checkoutSchema'

interface CheckoutFormProps {
  onValidSubmit?: (data: CheckoutShippingInput) => void
}

export function CheckoutForm({ onValidSubmit }: CheckoutFormProps) {
  const currentStep = useCheckoutStore((s) => s.currentStep)

  if (currentStep === 'order') {
    return null
  }

  return (
    <div className="min-w-0">
      {currentStep === 'shipping' || currentStep === 'payment' ? (
        <ShippingForm onValidSubmit={onValidSubmit} />
      ) : null}
    </div>
  )
}
