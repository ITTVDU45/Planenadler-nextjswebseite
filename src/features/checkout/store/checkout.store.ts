'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CheckoutStepId,
  ShippingMethodId,
  PaymentMethodId,
  CheckoutFormShipping,
} from '../types/checkout.types'

export interface LastCompletedOrderSnapshot {
  orderNumber?: number | string | null
  databaseId?: string | null
  date?: string | null
  status?: string | null
  completedAt: number
}

interface CheckoutState {
  currentStep: CheckoutStepId
  selectedShipping: ShippingMethodId
  selectedPayment: PaymentMethodId
  orderCompleted: boolean
  lastCompletedOrder: LastCompletedOrderSnapshot | null
  shippingData: CheckoutFormShipping | null
  setCurrentStep: (step: CheckoutStepId) => void
  setSelectedShipping: (id: ShippingMethodId) => void
  setSelectedPayment: (id: PaymentMethodId) => void
  setOrderCompleted: (value: boolean) => void
  setLastCompletedOrder: (value: LastCompletedOrderSnapshot | null) => void
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
      lastCompletedOrder: null,
      shippingData: null,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setSelectedShipping: (selectedShipping) => set({ selectedShipping }),
      setSelectedPayment: (selectedPayment) => set({ selectedPayment }),
      setOrderCompleted: (orderCompleted) => set({ orderCompleted }),
      setLastCompletedOrder: (lastCompletedOrder) => set({ lastCompletedOrder }),
      setShippingData: (shippingData) => set({ shippingData }),
      reset: () =>
        set({
          currentStep: 'shipping',
          selectedShipping: DEFAULT_SHIPPING,
          selectedPayment: DEFAULT_PAYMENT,
          orderCompleted: false,
          lastCompletedOrder: null,
          shippingData: null,
        }),
    }),
    {
      name: 'checkout-store',
      partialize: (state) => ({
        shippingData: state.shippingData,
        selectedShipping: state.selectedShipping,
        selectedPayment: state.selectedPayment,
        orderCompleted: state.orderCompleted,
        lastCompletedOrder: state.lastCompletedOrder,
      }),
    }
  )
)
