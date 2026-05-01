'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CheckoutStepId,
  ShippingMethodId,
  PaymentMethodId,
  CheckoutFormShipping,
} from '../types/checkout.types'
import type { OrderReceiptSnapshot } from '../lib/build-order-receipt-snapshot'

export type { OrderReceiptSnapshot } from '../lib/build-order-receipt-snapshot'

export interface LastCompletedOrderSnapshot {
  orderNumber?: number | string | null
  databaseId?: string | null
  date?: string | null
  status?: string | null
  orderKey?: string | null
  receipt?: OrderReceiptSnapshot | null
  completedAt: number
}

export interface PendingExternalPaymentSnapshot {
  provider: PaymentMethodId
  startedAt: number
  orderId?: string | null
  orderKey?: string | null
  status?: string | null
}

const PENDING_EXTERNAL_PAYMENT_MAX_AGE_MS = 6 * 60 * 60 * 1000

export function hasActivePendingExternalPayment(
  pendingExternalPayment: PendingExternalPaymentSnapshot | null | undefined
): boolean {
  if (!pendingExternalPayment) return false
  return Date.now() - pendingExternalPayment.startedAt < PENDING_EXTERNAL_PAYMENT_MAX_AGE_MS
}

interface CheckoutState {
  currentStep: CheckoutStepId
  selectedShipping: ShippingMethodId
  selectedPayment: PaymentMethodId
  orderCompleted: boolean
  lastCompletedOrder: LastCompletedOrderSnapshot | null
  pendingExternalPayment: PendingExternalPaymentSnapshot | null
  shippingData: CheckoutFormShipping | null
  setCurrentStep: (step: CheckoutStepId) => void
  setSelectedShipping: (id: ShippingMethodId) => void
  setSelectedPayment: (id: PaymentMethodId) => void
  setOrderCompleted: (value: boolean) => void
  setLastCompletedOrder: (value: LastCompletedOrderSnapshot | null) => void
  setPendingExternalPayment: (value: PendingExternalPaymentSnapshot | null) => void
  clearPendingExternalPayment: () => void
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
      pendingExternalPayment: null,
      shippingData: null,
      setCurrentStep: (currentStep) => set({ currentStep }),
      setSelectedShipping: (selectedShipping) => set({ selectedShipping }),
      setSelectedPayment: (selectedPayment) => set({ selectedPayment }),
      setOrderCompleted: (orderCompleted) => set({ orderCompleted }),
      setLastCompletedOrder: (lastCompletedOrder) => set({ lastCompletedOrder }),
      setPendingExternalPayment: (pendingExternalPayment) => set({ pendingExternalPayment }),
      clearPendingExternalPayment: () => set({ pendingExternalPayment: null }),
      setShippingData: (shippingData) => set({ shippingData }),
      reset: () =>
        set({
          currentStep: 'shipping',
          selectedShipping: DEFAULT_SHIPPING,
          selectedPayment: DEFAULT_PAYMENT,
          orderCompleted: false,
          lastCompletedOrder: null,
          pendingExternalPayment: null,
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
        pendingExternalPayment: state.pendingExternalPayment,
      }),
    }
  )
)
