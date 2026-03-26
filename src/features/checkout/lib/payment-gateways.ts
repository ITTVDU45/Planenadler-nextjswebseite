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
const CARD_ALIASES = [
  'woocommerce_payments',
  'wcpay',
  'stripe',
  'stripe_cc',
  'stripe_credit_card',
  'credit_card',
]
const BANK_ALIASES = ['bacs', 'bank_transfer', 'direct_bank_transfer']

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
      frontendReady: () => false,
      helperText: (available) =>
        available
          ? 'Backend erkennt Karte, aber der direkte Karten-Flow ist in Next.js noch nicht live.'
          : undefined,
    },
    {
      id: 'wallet',
      label: 'Apple Pay / Google Pay',
      description: 'Nur wenn Browser und Gateway dies unterstuetzen',
      aliases: CARD_ALIASES,
      action: 'select',
      frontendReady: () => false,
      helperText: (available) => {
        if (!available) return undefined
        if (!hasStripePublishableKey) {
          return 'Wallet wurde im Backend erkannt, aber der Stripe Public Key fehlt im Frontend.'
        }
        return 'Wallet wurde erkannt, benoetigt aber noch den echten Express-Flow im Frontend.'
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

