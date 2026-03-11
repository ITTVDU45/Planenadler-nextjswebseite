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

const SHIPPING_PATH = '/checkout/shipping'
const CONFIRMATION_PATH = '/checkout/confirmation'

interface CheckoutMutationResponse {
  checkout?: {
    result?: string | null
    redirect?: string | null
  } | null
}

const PROVIDER_PAYMENT_METHOD_CANDIDATES: Record<'paypal' | 'klarna', string[]> = {
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
  const { cart, syncWithWooCommerce, clearWooCommerceSession } = useCartStore()
  const { shippingData, selectedPayment, setOrderCompleted } = useCheckoutStore()

  const { data } = useQuery(GET_CART, { notifyOnNetworkStatusChange: true })

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
      const sd = useCheckoutStore.getState().shippingData
      const products = useCartStore.getState().cart?.products ?? []
      if (!sd || products.length === 0) {
        // startTransition verhindert "Router action dispatched before initialization" bei HMR.
        startTransition(() => router.replace(SHIPPING_PATH))
      } else {
        setGuardPassed(true)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [router])

  const [checkoutMutation, { loading: checkoutLoading }] = useMutation<CheckoutMutationResponse>(CHECKOUT_MUTATION)

  const tryProviderCheckoutMutation = async (
    paymentMethod: 'paypal' | 'klarna',
    formData: CheckoutFormShipping
  ): Promise<string | null> => {
    const methodCandidates = PROVIDER_PAYMENT_METHOD_CANDIDATES[paymentMethod]

    for (const wcPaymentMethod of methodCandidates) {
      try {
        const orderProps = toCheckoutDataProps(formData, wcPaymentMethod)
        const input = createCheckoutData(orderProps)
        const { data: mutationData } = await checkoutMutation({ variables: { input } })
        const redirectUrl = mutationData?.checkout?.redirect
        if (redirectUrl) {
          return redirectUrl
        }
      } catch {
        // Continue with next gateway candidate.
      }
    }

    return null
  }

  const handlePlaceOrder = async () => {
    if (!shippingData) return
    setSubmitError(null)
    try {
      const orderProps = toCheckoutDataProps(shippingData, 'bacs')
      const input = createCheckoutData(orderProps)
      const { data: mutationData } = await checkoutMutation({ variables: { input } })
      const redirectUrl = mutationData?.checkout?.redirect
      if (redirectUrl) {
        window.location.assign(redirectUrl)
        return
      }
      setOrderCompleted(true)
      clearWooCommerceSession()
      router.push(CONFIRMATION_PATH)
    } catch {
      setSubmitError('Bestellung konnte nicht abgeschlossen werden. Bitte erneut versuchen.')
    }
  }

  const handleProviderRedirect = async (paymentMethod: 'paypal' | 'klarna') => {
    if (!shippingData) return
    setSubmitError(null)
    setProviderLoading(paymentMethod)

    try {
      const directRedirectUrl = await tryProviderCheckoutMutation(paymentMethod, shippingData)
      if (directRedirectUrl) {
        window.location.assign(directRedirectUrl)
        return
      }

      const orderProps = toCheckoutDataProps(shippingData, paymentMethod)
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
            'Klarna/PayPal-Weiterleitung fehlt. Bitte prüfen Sie WooCommerce-Gateway und Provider-Endpoint.'
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

  if (!guardPassed) {
    return (
      <ContentShell className="py-12">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <p className="text-[#1F5CAB]/90">Lade…</p>
        </div>
      </ContentShell>
    )
  }

  return (
    <ContentShell className="py-8 lg:py-12">
      <CheckoutSteps currentStep="payment" showChangeShipping />

      {submitError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="min-w-0">
          <PaymentMethods hideWallet />
          {selectedPayment === PAYMENT_METHOD_IDS.CARD ? <CardPaymentForm /> : null}
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
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary />
        </div>
      </div>
    </ContentShell>
  )
}
