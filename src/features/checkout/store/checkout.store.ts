'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CheckoutStepId,
  ShippingMethodId,
  PaymentMethodId,
  CheckoutFormShipping,
} from '../types/checkout.types'

interface CheckoutState {
  currentStep: CheckoutStepId
  selectedShipping: ShippingMethodId
  selectedPayment: PaymentMethodId
  orderCompleted: boolean
  shippingData: CheckoutFormShipping | null
  setCurrentStep: (step: CheckoutStepId) => void
  setSelectedShipping: (id: ShippingMethodId) => void
  setSelectedPayment: (id: PaymentMethodId) => void
  setOrderCompleted: (value: boolean) => void
  setShippingData: (data: CheckoutFormShipping | null) => void
  reset: () => void
}

const DEFAULT_SHIPPING: ShippingMethodId = 'free_shipping'
const DEFAULT_PAYMENT: PaymentMethodId = 'bacs'

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      currentStep: 'shipping',
      selectedShipping: DEFAULT_SHIPPING,
      selectedPayment: DEFAULT_PAYMENT,
      orderCompleted: false,
      shippingData: null,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setSelectedShipping: (selectedShipping) => set({ selectedShipping }),
      setSelectedPayment: (selectedPayment) => set({ selectedPayment }),
      setOrderCompleted: (orderCompleted) => set({ orderCompleted }),
      setShippingData: (shippingData) => set({ shippingData }),
      reset: () =>
        set({
          currentStep: 'shipping',
          selectedShipping: DEFAULT_SHIPPING,
          selectedPayment: DEFAULT_PAYMENT,
          orderCompleted: false,
          shippingData: null,
        }),
    }),
    {
      name: 'checkout-store',
      partialize: (state) => ({
        shippingData: state.shippingData,
        selectedShipping: state.selectedShipping,
        selectedPayment: state.selectedPayment,
      }),
    }
  )
)
