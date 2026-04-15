'use client'

import { useEffect, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { useCartStore } from '@/shared/lib/cartStore'
import { getFormattedCart, createCheckoutData } from '@/shared/lib/functions'
import { GET_CART } from '@/features/cart/api/queries'
import { CHECKOUT_MUTATION } from '@/shared/lib/GQL_MUTATIONS'
import type { ICheckoutDataProps } from '@/shared/types/checkout'
import type { CheckoutFormShipping } from '../types/checkout.types'
import { useCheckoutStore } from '../store/checkout.store'
import { CheckoutSteps } from './CheckoutSteps'
import { PaymentMethods } from './PaymentMethods'
import { CardPaymentForm } from './CardPaymentForm'
import { PayPalPanel } from './PayPalPanel'
import { KlarnaPanel } from './KlarnaPanel'
import { BankTransferPanel } from './BankTransferPanel'
import { CheckoutOrderSummary } from './OrderSummary'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { PAYMENT_METHOD_IDS } from '../types/checkout.types'
import type { PaymentMethodId } from '../types/checkout.types'
import { ExpressCheckout } from './ExpressCheckout'
import { usePaymentOptions } from '../hooks/usePaymentOptions'
import {
  buildBankTransferCheckoutCandidates,
  buildCardCheckoutCandidates,
} from '../lib/payment-gateways'
import { buildOrderReceiptSnapshot } from '../lib/build-order-receipt-snapshot'
import {
  isWooCommerceOrderReceivedRedirect,
  parseWooOrderReceivedUrl,
} from '../lib/woo-order-received-redirect'

const SHIPPING_PATH = '/checkout/shipping'
const THANK_YOU_PATH = '/thank-you'

interface CheckoutMutationResponse {
  checkout?: {
    result?: string | null
    redirect?: string | null
    order?: {
      id?: string | null
      databaseId?: string | number | null
      orderNumber?: number | string | null
      date?: string | null
      status?: string | null
    } | null
  } | null
}

const PROVIDER_PAYMENT_METHOD_CANDIDATES: Record<'card' | 'paypal' | 'klarna', string[]> = {
  card: ['woocommerce_payments', 'wcpay', 'stripe', 'stripe_cc', 'stripe_credit_card', 'credit_card'],
  paypal: ['ppcp', 'ppcp-gateway', 'paypal'],
  klarna: ['stripe_klarna', 'woocommerce_payments_klarna', 'klarna_payments', 'klarna'],
}

function toCheckoutDataProps(data: CheckoutFormShipping, paymentMethod: string): ICheckoutDataProps {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    address1: data.address1,
    address2: data.address2 ?? '',
    city: data.city,
    postcode: data.postcode,
    country: data.country,
    state: data.state ?? '',
    company: '',
    paymentMethod,
    shipToDifferentAddress: data.shipToDifferentAddress,
    shippingFirstName: data.shippingFirstName,
    shippingLastName: data.shippingLastName,
    shippingAddress1: data.shippingAddress1,
    shippingAddress2: data.shippingAddress2,
    shippingPostcode: data.shippingPostcode,
    shippingCity: data.shippingCity,
    shippingCountry: data.shippingCountry,
    shippingState: data.shippingState,
  }
}

export function PaymentPageContent() {
  const router = useRouter()
  const { syncWithWooCommerce, clearWooCommerceSession } = useCartStore()
  const { shippingData, selectedPayment, setSelectedPayment, setOrderCompleted, setLastCompletedOrder } =
    useCheckoutStore()

  const { data } = useQuery(GET_CART, { notifyOnNetworkStatusChange: true })
  const {
    data: paymentOptions,
    loading: paymentOptionsLoading,
    error: paymentOptionsError,
    refresh: refreshPaymentOptions,
  } = usePaymentOptions()

  useEffect(() => {
    if (!data) return
    const updatedCart = getFormattedCart(data)
    if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
      clearWooCommerceSession()
      return
    }
    if (updatedCart) syncWithWooCommerce(updatedCart)
  }, [data, clearWooCommerceSession, syncWithWooCommerce])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [guardPassed, setGuardPassed] = useState(false)
  const [providerLoading, setProviderLoading] = useState<PaymentMethodId | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const state = useCheckoutStore.getState()
      const products = useCartStore.getState().cart?.products ?? []
      if (!state.shippingData || products.length === 0) {
        startTransition(() => router.replace(SHIPPING_PATH))
      } else {
        setGuardPassed(true)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    if (!paymentOptions?.gateways?.length) return

    const selectedGateway = paymentOptions.gateways.find((gateway) => gateway.id === selectedPayment)
    if (selectedGateway?.available) return

    const fallback = paymentOptions.gateways.find((gateway) => gateway.available && gateway.frontendReady)
    if (fallback && fallback.id !== selectedPayment) {
      setSelectedPayment(fallback.id)
    }
  }, [paymentOptions, selectedPayment, setSelectedPayment])

  const [checkoutMutation, { loading: checkoutLoading }] = useMutation<CheckoutMutationResponse>(CHECKOUT_MUTATION)

  const tryProviderCheckoutMutation = async (
    paymentMethod: 'card' | 'paypal' | 'klarna',
    formData: CheckoutFormShipping,
  ): Promise<{
    redirectUrl: string | null
    checkout: CheckoutMutationResponse['checkout'] | null
  }> => {
    const methodCandidates = PROVIDER_PAYMENT_METHOD_CANDIDATES[paymentMethod]

    for (const wcPaymentMethod of methodCandidates) {
      try {
        const orderProps = toCheckoutDataProps(formData, wcPaymentMethod)
        const input = createCheckoutData(orderProps)
        const { data: mutationData } = await checkoutMutation({ variables: { input } })
        const checkout = mutationData?.checkout ?? null
        const redirectUrl = checkout?.redirect ?? null
        if (redirectUrl) {
          return { redirectUrl, checkout }
        }
      } catch {
        // Continue with next gateway candidate.
      }
    }

    return { redirectUrl: null, checkout: null }
  }

  const finalizeSuccessfulOrder = (
    checkout: CheckoutMutationResponse['checkout'] | null | undefined,
    redirectUrl: string | null,
  ) => {
    if (!shippingData) return

    const order = checkout?.order
    const parsedFromWoo =
      redirectUrl && isWooCommerceOrderReceivedRedirect(redirectUrl)
        ? parseWooOrderReceivedUrl(redirectUrl)
        : { orderId: null, orderKey: null }

    const paymentLabel =
      paymentOptions?.gateways?.find((g) => g.id === selectedPayment)?.label?.trim() ||
      (selectedPayment === PAYMENT_METHOD_IDS.BANK ? 'Direkte Banküberweisung' : 'Onlinezahlung')

    const cartSnapshot = useCartStore.getState().cart
    const receipt =
      cartSnapshot && cartSnapshot.products.length > 0
        ? buildOrderReceiptSnapshot(cartSnapshot, shippingData, paymentLabel)
        : null

    const dbFromGraphql =
      order?.databaseId !== undefined && order?.databaseId !== null ? String(order.databaseId) : null

    setLastCompletedOrder({
      orderNumber: order?.orderNumber ?? parsedFromWoo.orderId,
      databaseId: dbFromGraphql ?? parsedFromWoo.orderId,
      date: order?.date ?? null,
      status: order?.status ?? null,
      orderKey: parsedFromWoo.orderKey,
      completedAt: Date.now(),
      receipt,
    })
    setOrderCompleted(true)
    clearWooCommerceSession()
    router.push(THANK_YOU_PATH)
  }

  const handlePlaceOrder = async () => {
    if (!shippingData) return
    setSubmitError(null)

    const bankGateway = paymentOptions?.gateways?.find((gateway) => gateway.id === PAYMENT_METHOD_IDS.BANK)
    const wcMethodCandidates = buildBankTransferCheckoutCandidates(bankGateway)

    let lastErrorMessage = 'Bestellung konnte nicht abgeschlossen werden. Bitte erneut versuchen.'

    for (const wcMethod of wcMethodCandidates) {
      try {
        const orderProps = toCheckoutDataProps(shippingData, wcMethod)
        const input = createCheckoutData(orderProps)
        const result = await checkoutMutation({ variables: { input } })
        if (result.errors?.length) {
          lastErrorMessage = result.errors.map((e) => e.message).filter(Boolean).join(' ') || lastErrorMessage
          continue
        }
        const mutationData = result.data
        const redirectUrl = mutationData?.checkout?.redirect ?? null
        if (redirectUrl && !isWooCommerceOrderReceivedRedirect(redirectUrl)) {
          window.location.assign(redirectUrl)
          return
        }
        finalizeSuccessfulOrder(mutationData?.checkout, redirectUrl)
        return
      } catch (error) {
        lastErrorMessage =
          error instanceof Error && error.message.trim() ? error.message.trim() : lastErrorMessage
      }
    }

    setSubmitError(lastErrorMessage)
  }

  const handleProviderRedirect = async (paymentMethod: 'card' | 'paypal' | 'klarna') => {
    if (!shippingData) return
    setSubmitError(null)
    setProviderLoading(paymentMethod)
    setSelectedPayment(paymentMethod)

    try {
      const { redirectUrl: directRedirectUrl, checkout: directCheckout } =
        await tryProviderCheckoutMutation(paymentMethod, shippingData)
      if (directRedirectUrl) {
        if (isWooCommerceOrderReceivedRedirect(directRedirectUrl)) {
          finalizeSuccessfulOrder(directCheckout, directRedirectUrl)
          return
        }
        window.location.assign(directRedirectUrl)
        return
      }

      const gateway =
        paymentMethod === PAYMENT_METHOD_IDS.CARD
          ? paymentOptions?.gateways?.find((candidate) => candidate.id === PAYMENT_METHOD_IDS.CARD)
          : undefined
      const checkoutMethod =
        paymentMethod === PAYMENT_METHOD_IDS.CARD
          ? buildCardCheckoutCandidates(gateway)[0] ?? PAYMENT_METHOD_IDS.CARD
          : paymentMethod
      const orderProps = toCheckoutDataProps(shippingData, checkoutMethod)
      const checkoutInput = createCheckoutData(orderProps)
      const response = await fetch('/api/checkout/provider-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: paymentMethod,
          checkoutInput,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        redirectUrl?: string
        error?: string
      }
      const redirectUrl = payload.redirectUrl
      if (!redirectUrl) {
        setSubmitError(
          payload.error ??
            'Die Provider-Weiterleitung fehlt. Bitte pruefen Sie WooCommerce-Gateway, Session und Store API.'
        )
        return
      }

      window.location.assign(redirectUrl)
    } catch {
      setSubmitError('Zahlung konnte nicht gestartet werden. Bitte erneut versuchen.')
    } finally {
      setProviderLoading(null)
    }
  }

  const handleExpressActivation = (gatewayId: PaymentMethodId) => {
    if (gatewayId === PAYMENT_METHOD_IDS.CARD) {
      void handleProviderRedirect('card')
      return
    }
    if (gatewayId === PAYMENT_METHOD_IDS.PAYPAL) {
      void handleProviderRedirect('paypal')
      return
    }
    if (gatewayId === PAYMENT_METHOD_IDS.KLARNA) {
      void handleProviderRedirect('klarna')
      return
    }

    setSelectedPayment(gatewayId)
  }

  if (!guardPassed) {
    return (
      <ContentShell className="py-12">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <p className="text-[#1F5CAB]/90">Lade...</p>
        </div>
      </ContentShell>
    )
  }

  const selectedGateway = paymentOptions?.gateways.find((gateway) => gateway.id === selectedPayment)

  return (
    <ContentShell className="py-8 lg:py-12">
      <CheckoutSteps currentStep="payment" showChangeShipping />

      {submitError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="min-w-0 space-y-6">
          <ExpressCheckout
            title="Express Checkout"
            subtitle="Starten Sie direkt mit Ihrer bevorzugten Zahlungsart."
            gateways={paymentOptions?.gateways ?? []}
            loading={paymentOptionsLoading}
            error={paymentOptionsError}
            context="payment"
            providerLoading={providerLoading}
            onActivateGateway={handleExpressActivation}
            onRefresh={refreshPaymentOptions}
          />

          <PaymentMethods
            options={paymentOptions?.gateways}
            loading={paymentOptionsLoading}
          />

          {selectedPayment === PAYMENT_METHOD_IDS.CARD ? (
            <CardPaymentForm
              onContinue={() => {
                void handleProviderRedirect('card')
              }}
              isSubmitting={providerLoading === PAYMENT_METHOD_IDS.CARD}
              helperText={selectedGateway?.helperText}
            />
          ) : null}
          {selectedPayment === PAYMENT_METHOD_IDS.PAYPAL ? (
            <PayPalPanel
              onContinue={() => {
                void handleProviderRedirect('paypal')
              }}
              isSubmitting={providerLoading === PAYMENT_METHOD_IDS.PAYPAL}
            />
          ) : null}
          {selectedPayment === PAYMENT_METHOD_IDS.KLARNA ? (
            <KlarnaPanel
              onContinue={() => {
                void handleProviderRedirect('klarna')
              }}
              isSubmitting={providerLoading === PAYMENT_METHOD_IDS.KLARNA}
            />
          ) : null}
          {selectedPayment === PAYMENT_METHOD_IDS.BANK ? (
            <BankTransferPanel
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={checkoutLoading}
            />
          ) : null}
          {selectedPayment === PAYMENT_METHOD_IDS.WALLET ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {selectedGateway?.helperText ??
                'Wallet wird vom Backend erkannt, ist in dieser Next.js-Checkout-Stufe aber noch nicht direkt ansprechbar.'}
            </div>
          ) : null}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary />
        </div>
      </div>
    </ContentShell>
  )
}
