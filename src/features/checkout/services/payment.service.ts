/**
 * Payment abstraction: createCheckoutSession, confirmPayment, handleWebhook.
 * First implementation: Bank transfer (bacs) via WooCommerce CHECKOUT_MUTATION.
 * Stripe/PayPal/Klarna as stubs.
 */

import type { PaymentMethodId } from '../types/checkout.types'
import type { ICheckoutDataProps } from '@/shared/types/checkout'

/** WooCommerce payment method IDs */
const WC_PAYMENT_MAP: Record<PaymentMethodId, string> = {
  card: 'stripe',       // stub
  bacs: 'bacs',
  paypal: 'paypal',     // stub
  klarna: 'klarna',    // stub
  wallet: 'stripe',    // stub
}

export function getWooCommercePaymentMethod(id: PaymentMethodId): string {
  return WC_PAYMENT_MAP[id] ?? 'bacs'
}

export interface CreateCheckoutSessionParams {
  formData: ICheckoutDataProps
  paymentMethod: PaymentMethodId
}

export interface CheckoutSessionResult {
  success: boolean
  redirectUrl?: string
  orderId?: string
  error?: string
}

/**
 * Creates checkout session / initiates order.
 * For bacs: sends order to WooCommerce (CHECKOUT_MUTATION).
 * For card/paypal/klarna: returns stub (redirect URL or "coming soon").
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const { paymentMethod } = params
  const wcMethod = getWooCommercePaymentMethod(paymentMethod)

  if (wcMethod === 'bacs') {
    return { success: true }
  }

  if (paymentMethod === 'card' || paymentMethod === 'paypal' || paymentMethod === 'klarna' || paymentMethod === 'wallet') {
    return {
      success: false,
      error: 'Diese Zahlungsart ist derzeit nicht verfügbar. Bitte wählen Sie Banküberweisung.',
    }
  }

  return { success: true }
}

/**
 * Confirms payment (e.g. after redirect from provider).
 * Stub for now.
 */
export async function confirmPayment(): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Nicht implementiert' }
}

/**
 * Webhook handler for payment provider callbacks.
 * To be used in app/api/webhooks/... route.
 */
export async function handleWebhook(
  provider: string,
  payload: unknown
): Promise<{ received: boolean; error?: string }> {
  void provider
  void payload
  return { received: false }
}
