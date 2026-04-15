import type { PaymentMethodId } from '../types/checkout.types'

export interface CheckoutGatewayOption {
  id: PaymentMethodId
  label: string
  description?: string
  available: boolean
  frontendReady: boolean
  expressEligible: boolean
  action: 'redirect' | 'select'
  wcPaymentMethodId?: string
  wcPaymentMethodAliases: string[]
  helperText?: string
}

export interface CheckoutGatewayDiagnostics {
  upstreamUrl: string
  cartUrl: string
  cartFetchOk: boolean
  checkoutBootstrapOk: boolean
  cookiePresent: boolean
  /** Woo-Session-Header an Store API gesendet (wie /api/graphql) */
  wooSessionHeaderSent: boolean
  cartItemCount: number
  availablePaymentMethods: string[]
  paymentRequirements: string[]
  errors: string[]
}

export interface PaymentOptionsResponse {
  gateways: CheckoutGatewayOption[]
  diagnostics: CheckoutGatewayDiagnostics
}

interface GatewayDefinition {
  id: PaymentMethodId
  label: string
  description?: string
  aliases: string[]
  action: 'redirect' | 'select'
  frontendReady: (availableMethodIds: string[]) => boolean
  helperText?: (available: boolean, frontendReady: boolean) => string | undefined
}

const PAYPAL_ALIASES = ['ppcp', 'ppcp-gateway', 'paypal', 'paypal_checkout', 'ppec_paypal']
const KLARNA_ALIASES = ['stripe_klarna', 'woocommerce_payments_klarna', 'klarna_payments', 'klarna', 'kco']
export const CARD_ALIASES = [
  'woocommerce_payments',
  'wcpay',
  'stripe',
  'stripe_cc',
  'stripe_credit_card',
  'credit_card',
]
/** Häufige WooCommerce- und Plugin-IDs für Überweisung / Vorkasse */
const BANK_ALIASES = [
  'bacs',
  'bank_transfer',
  'direct_bank_transfer',
  'woocommerce_bacs',
  'woocommerce-bacs',
  'wc-bacs',
  'prepayment',
  'vorkasse',
]

function hasAlias(availableMethodIds: string[], aliases: string[]): boolean {
  if (!availableMethodIds.length) return false
  const normalized = availableMethodIds.map((id) => id.toLowerCase())
  return aliases.some((alias) => normalized.includes(alias.toLowerCase()))
}

function getFirstMatch(availableMethodIds: string[], aliases: string[]): string | undefined {
  const normalized = new Map(availableMethodIds.map((id) => [id.toLowerCase(), id]))
  for (const alias of aliases) {
    const match = normalized.get(alias.toLowerCase())
    if (match) return match
  }
  return undefined
}

export function getGatewayDefinitions(hasStripePublishableKey: boolean): GatewayDefinition[] {
  return [
    {
      id: 'paypal',
      label: 'PayPal',
      description: 'Direkt zu PayPal weiterleiten',
      aliases: PAYPAL_ALIASES,
      action: 'redirect',
      frontendReady: () => true,
    },
    {
      id: 'klarna',
      label: 'Klarna',
      description: 'Direkt zu Klarna weiterleiten',
      aliases: KLARNA_ALIASES,
      action: 'redirect',
      frontendReady: () => true,
    },
    {
      id: 'card',
      label: 'Karte',
      description: 'VISA, Mastercard, AMEX',
      aliases: CARD_ALIASES,
      action: 'select',
      frontendReady: () => true,
      helperText: (available) =>
        available
          ? 'Kartenzahlung wird sicher ueber Stripe weitergeleitet.'
          : undefined,
    },
    {
      id: 'wallet',
      label: 'Apple Pay / Google Pay',
      description: 'Nur wenn Browser und Gateway dies unterstuetzen',
      aliases: CARD_ALIASES,
      action: 'select',
      frontendReady: () => hasStripePublishableKey,
      helperText: (available, frontendReady) => {
        if (!available) return undefined
        if (!hasStripePublishableKey) {
          return 'Wallet wurde im Backend erkannt, aber der Stripe Public Key fehlt im Frontend.'
        }
        if (frontendReady) {
          return 'Apple Pay und Google Pay werden ueber Stripe bereitgestellt, wenn Browser und Geraet sie unterstuetzen.'
        }
        return 'Wallet wurde erkannt, ist fuer diese Session aber noch nicht verfuegbar.'
      },
    },
    {
      id: 'bacs',
      label: 'Direkte Bankueberweisung',
      aliases: BANK_ALIASES,
      action: 'select',
      frontendReady: () => true,
    },
  ]
}

/**
 * Reihenfolge: zuerst vom Store gematchte WC-ID, dann typische Fallback-IDs für GraphQL-Checkout.
 */
export function buildBankTransferCheckoutCandidates(gateway: CheckoutGatewayOption | undefined): string[] {
  const ordered: string[] = []
  const add = (id: string | undefined) => {
    const t = id?.trim()
    if (t && !ordered.includes(t)) ordered.push(t)
  }
  add(gateway?.wcPaymentMethodId)
  for (const alias of BANK_ALIASES) add(alias)
  return ordered
}

export function buildCardCheckoutCandidates(gateway: CheckoutGatewayOption | undefined): string[] {
  const ordered: string[] = []
  const add = (id: string | undefined) => {
    const t = id?.trim()
    if (t && !ordered.includes(t)) ordered.push(t)
  }
  add(gateway?.wcPaymentMethodId)
  for (const alias of CARD_ALIASES) add(alias)
  return ordered
}

export function resolveCheckoutGateways(
  availableMethodIds: string[],
  hasStripePublishableKey: boolean
): CheckoutGatewayOption[] {
  return getGatewayDefinitions(hasStripePublishableKey).map((gateway) => {
    const available = hasAlias(availableMethodIds, gateway.aliases)
    const frontendReady = available && gateway.frontendReady(availableMethodIds)
    return {
      id: gateway.id,
      label: gateway.label,
      description: gateway.description,
      available,
      frontendReady,
      expressEligible: frontendReady && gateway.action === 'redirect',
      action: gateway.action,
      wcPaymentMethodId: getFirstMatch(availableMethodIds, gateway.aliases),
      wcPaymentMethodAliases: gateway.aliases,
      helperText: gateway.helperText?.(available, frontendReady),
    }
  })
}
