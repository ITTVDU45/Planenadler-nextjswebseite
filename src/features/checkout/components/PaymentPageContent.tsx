'use client'

import { useCallback, useEffect, useState, startTransition, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { useCartStore } from '@/shared/lib/cartStore'
import { getFormattedCart, createCheckoutData } from '@/shared/lib/functions'
import { GET_CART } from '@/features/cart/api/queries'
import { ADD_TO_CART, APPLY_COUPON, CHECKOUT_MUTATION, REMOVE_COUPONS } from '@/shared/lib/GQL_MUTATIONS'
import type { IAppliedCoupon } from '@/shared/types/graphql'
import type { ICheckoutDataProps } from '@/shared/types/checkout'
import type { CheckoutFormShipping } from '../types/checkout.types'
import { useCheckoutStore } from '../store/checkout.store'
import { hasActivePendingExternalPayment } from '../store/checkout.store'
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
const CHECKOUT_PROVIDER_CALLBACK_PATH = '/checkout/provider-callback'

function isPaidOrderStatus(status: string | null | undefined): boolean {
  if (!status) return false
  const normalized = status.trim().toLowerCase()
  return normalized === 'processing' || normalized === 'completed'
}

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
  const searchParams = useSearchParams()
  const { syncWithWooCommerce, clearWooCommerceSession } = useCartStore()
  const {
    shippingData,
    selectedPayment,
    setSelectedPayment,
    setOrderCompleted,
    setLastCompletedOrder,
    pendingExternalPayment,
    setPendingExternalPayment,
    clearPendingExternalPayment,
  } = useCheckoutStore()

  const { data, refetch } = useQuery(GET_CART, { notifyOnNetworkStatusChange: true })
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
      if (hasActivePendingExternalPayment(pendingExternalPayment)) return
      clearWooCommerceSession()
      return
    }
    if (updatedCart) syncWithWooCommerce(updatedCart)
  }, [data, clearWooCommerceSession, pendingExternalPayment, syncWithWooCommerce])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [guardPassed, setGuardPassed] = useState(false)
  const [providerLoading, setProviderLoading] = useState<PaymentMethodId | null>(null)
  const [restoreInFlight, setRestoreInFlight] = useState(false)
  const [restoreAttempted, setRestoreAttempted] = useState(false)
  const [paypalCaptureInFlight, setPaypalCaptureInFlight] = useState(false)
  const [paypalCaptureAttempted, setPaypalCaptureAttempted] = useState(false)

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

  useEffect(() => {
    if (!searchParams) return
    const provider = searchParams.get('provider')
    const status = searchParams.get('status')

    if (provider !== 'paypal' && provider !== 'klarna' && provider !== 'card') return
    if (status === 'cancel') {
      setSubmitError('Die externe Zahlung wurde abgebrochen. Deine Artikel sind weiterhin im Checkout und du kannst eine andere Zahlungsart waehlen.')
      return
    }
    if (status === 'success') {
      setCouponFeedback('Die Rueckkehr vom Zahlungsanbieter war erfolgreich. Wir pruefen jetzt den Zahlungsstatus deiner Bestellung.')
    }
  }, [searchParams])

  useEffect(() => {
    if (!searchParams || !shippingData) return
    const provider = searchParams.get('provider')
    const status = searchParams.get('status')

    if (provider !== 'paypal' || status !== 'success') return
    if (paypalCaptureInFlight || paypalCaptureAttempted) return

    const pendingState = useCheckoutStore.getState().pendingExternalPayment
    const orderId = searchParams.get('orderId') ?? pendingState?.orderId ?? ''
    const paypalOrderId =
      searchParams.get('token') ??
      searchParams.get('paypalOrderId') ??
      pendingState?.paypalOrderId ??
      ''

    if (!orderId || !paypalOrderId) {
      setPaypalCaptureAttempted(true)
      setSubmitError('PayPal hat keine ausreichenden Zahlungsdaten fuer den Abschluss zurueckgegeben.')
      return
    }

    setPaypalCaptureInFlight(true)
    setPaypalCaptureAttempted(true)
    setSubmitError(null)

    ;(async () => {
      try {
        const response = await fetch('/api/checkout/headless-paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'capture',
            orderId,
            paypalOrderId,
          }),
        })

        const payload = (await response.json().catch(() => ({}))) as {
          error?: string
          orderId?: string | number
          orderStatus?: string | null
          paypalStatus?: string | null
          captureId?: string | null
        }

        if (!response.ok) {
          throw new Error(payload.error ?? 'PayPal Capture fehlgeschlagen.')
        }

        if (!isPaidOrderStatus(payload.orderStatus)) {
          throw new Error(
            payload.paypalStatus
              ? `PayPal wurde nicht als bezahlt bestaetigt. Status: ${payload.paypalStatus}`
              : 'PayPal wurde nicht als bezahlt bestaetigt.'
          )
        }

        const paymentLabel =
          paymentOptions?.gateways?.find((g) => g.id === PAYMENT_METHOD_IDS.PAYPAL)?.label?.trim() || 'PayPal'
        const cartSnapshot = useCartStore.getState().cart
        const receipt =
          cartSnapshot && cartSnapshot.products.length > 0
            ? buildOrderReceiptSnapshot(cartSnapshot, shippingData, paymentLabel)
            : null

        setLastCompletedOrder({
          orderNumber: payload.orderId ?? orderId,
          databaseId: payload.orderId ? String(payload.orderId) : String(orderId),
          date: new Date().toISOString(),
          status: payload.orderStatus ?? 'processing',
          orderKey: pendingState?.orderKey ?? null,
          receipt,
          completedAt: Date.now(),
        })
        setOrderCompleted(true)
        clearPendingExternalPayment()
        clearWooCommerceSession()
        router.push(THANK_YOU_PATH)
      } catch (error) {
        const message = error instanceof Error && error.message.trim()
          ? error.message.trim()
          : 'Die PayPal-Zahlung konnte nicht abgeschlossen werden.'
        setSubmitError(message)
      } finally {
        setPaypalCaptureInFlight(false)
      }
    })()
  }, [
    clearPendingExternalPayment,
    clearWooCommerceSession,
    paymentOptions,
    paypalCaptureAttempted,
    paypalCaptureInFlight,
    router,
    searchParams,
    setLastCompletedOrder,
    setOrderCompleted,
    shippingData,
  ])

  const [checkoutMutation, { loading: checkoutLoading }] = useMutation<CheckoutMutationResponse>(CHECKOUT_MUTATION)
  const [applyCouponMutation, { loading: couponApplying }] = useMutation(APPLY_COUPON)
  const [removeCouponsMutation, { loading: couponRemoving }] = useMutation(REMOVE_COUPONS)
  const [addToCartMutation] = useMutation(ADD_TO_CART)

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
    clearPendingExternalPayment()
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
      if (paymentMethod === 'paypal') {
        const orderProps = toCheckoutDataProps(shippingData, PAYMENT_METHOD_IDS.PAYPAL)
        const checkoutInput = createCheckoutData(orderProps)
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const returnUrl = `${baseUrl}${CHECKOUT_PROVIDER_CALLBACK_PATH}?provider=paypal&status=success`
        const cancelUrl = `${baseUrl}${CHECKOUT_PROVIDER_CALLBACK_PATH}?provider=paypal&status=cancel`
        const checkoutItems =
          useCartStore
            .getState()
            .cart?.products.map((product) => product.restoreInput)
            .filter((item) => item.productId > 0 && item.quantity > 0) ?? []
        const couponCodes = (data?.cart?.appliedCoupons ?? [])
          .map((coupon: IAppliedCoupon) => coupon.code)
          .filter((code: unknown): code is string => typeof code === 'string' && code.trim().length > 0)

        const response = await fetch('/api/checkout/headless-paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            checkoutInput,
            checkoutItems,
            coupons: couponCodes,
            returnUrl,
            cancelUrl,
          }),
        })

        const payload = (await response.json().catch(() => ({}))) as {
          approveUrl?: string
          error?: string
          orderId?: string
          orderKey?: string | null
          paypalOrderId?: string
        }

        if (!response.ok || !payload.approveUrl) {
          setSubmitError(payload.error ?? 'PayPal konnte nicht gestartet werden.')
          return
        }

        setPendingExternalPayment({
          provider: paymentMethod,
          startedAt: Date.now(),
          orderId: payload.orderId ?? null,
          orderKey: payload.orderKey ?? null,
          paypalOrderId: payload.paypalOrderId ?? null,
          status: 'pending',
        })
        window.location.assign(payload.approveUrl)
        return
      }

      const { redirectUrl: directRedirectUrl, checkout: directCheckout } =
        await tryProviderCheckoutMutation(paymentMethod, shippingData)
      if (directRedirectUrl) {
        if (isWooCommerceOrderReceivedRedirect(directRedirectUrl)) {
          if (!isPaidOrderStatus(directCheckout?.order?.status)) {
            const parsed = parseWooOrderReceivedUrl(directRedirectUrl)
            setPendingExternalPayment({
              provider: paymentMethod,
              startedAt: Date.now(),
              orderId: parsed.orderId,
              orderKey: parsed.orderKey,
              status: directCheckout?.order?.status ?? null,
            })
            setSubmitError(
              'Die externe Zahlung wurde noch nicht abgeschlossen. Dein Warenkorb bleibt erhalten, damit du eine andere Zahlungsart waehlen oder spaeter fortsetzen kannst.'
            )
            return
          }
          finalizeSuccessfulOrder(directCheckout, directRedirectUrl)
          return
        }
        setPendingExternalPayment({
          provider: paymentMethod,
          startedAt: Date.now(),
          status: directCheckout?.order?.status ?? null,
        })
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
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const returnUrl =
        paymentMethod === 'klarna'
          ? `${baseUrl}${CHECKOUT_PROVIDER_CALLBACK_PATH}?provider=${paymentMethod}&status=success`
          : undefined
      const cancelUrl =
        paymentMethod === 'klarna'
          ? `${baseUrl}${CHECKOUT_PROVIDER_CALLBACK_PATH}?provider=${paymentMethod}&status=cancel`
          : undefined
      const checkoutItems =
        useCartStore
          .getState()
          .cart?.products.map((product) => product.restoreInput)
          .filter((item) => item.productId > 0 && item.quantity > 0) ?? []
      const response = await fetch('/api/checkout/provider-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: paymentMethod,
          checkoutInput,
          checkoutItems,
          returnUrl,
          cancelUrl,
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

      setPendingExternalPayment({
        provider: paymentMethod,
        startedAt: Date.now(),
      })
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
    if (gatewayId === PAYMENT_METHOD_IDS.WALLET) {
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

  const syncCartFromLatestQuery = useCallback(async () => {
    const result = await refetch()
    const updatedCart = result.data ? getFormattedCart(result.data) : undefined
    if (!updatedCart && !result.data?.cart?.contents?.nodes?.length) {
      clearWooCommerceSession()
      return
    }
    if (updatedCart) syncWithWooCommerce(updatedCart)
  }, [clearWooCommerceSession, refetch, syncWithWooCommerce])

  useEffect(() => {
    if (!guardPassed) return
    if (!hasActivePendingExternalPayment(pendingExternalPayment)) return
    if (restoreInFlight || restoreAttempted) return
    if ((data?.cart?.contents?.nodes?.length ?? 0) > 0) return

    const persistedCart = useCartStore.getState().cart
    const restoreItems = persistedCart?.products
      ?.map((product) => product.restoreInput)
      .filter((item) => item && item.productId > 0 && item.quantity > 0) ?? []

    if (restoreItems.length === 0) {
      setRestoreAttempted(true)
      return
    }

    setRestoreInFlight(true)
    setRestoreAttempted(true)
    setSubmitError(null)

    ;(async () => {
      try {
        for (const item of restoreItems) {
          await addToCartMutation({
            variables: {
              input: {
                clientMutationId: `restore-cart-${Date.now()}-${item.productId}`,
                productId: item.productId,
                quantity: item.quantity,
                ...(item.extraData ? { extraData: item.extraData } : {}),
              },
            },
          })
        }

        await syncCartFromLatestQuery()
        setCouponFeedback('Dein Warenkorb wurde nach der Rueckkehr von der externen Zahlung wiederhergestellt.')
      } catch (error) {
        const message = error instanceof Error && error.message.trim()
          ? error.message.trim()
          : 'Der Warenkorb konnte nach der Rueckkehr von PayPal nicht automatisch wiederhergestellt werden.'
        setSubmitError(message)
      } finally {
        setRestoreInFlight(false)
      }
    })()
  }, [
    addToCartMutation,
    data,
    guardPassed,
    pendingExternalPayment,
    restoreAttempted,
    restoreInFlight,
    syncCartFromLatestQuery,
  ])

  const handleApplyCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedCode = couponCode.trim()
    if (!normalizedCode) {
      setCouponError('Bitte geben Sie einen Gutscheincode ein.')
      setCouponFeedback(null)
      return
    }

    setCouponError(null)
    setCouponFeedback(null)

    try {
      await applyCouponMutation({
        variables: {
          input: {
            clientMutationId: `apply-coupon-${Date.now()}`,
            code: normalizedCode,
          },
        },
      })
      await syncCartFromLatestQuery()
      setCouponFeedback(`Gutscheincode ${normalizedCode} wurde angewendet.`)
      setCouponCode('')
    } catch (error) {
      const message = error instanceof Error && error.message.trim()
        ? error.message.trim()
        : 'Der Gutscheincode konnte nicht angewendet werden.'
      setCouponError(message)
    }
  }

  const handleRemoveCoupon = async (code: string) => {
    setCouponError(null)
    setCouponFeedback(null)

    try {
      await removeCouponsMutation({
        variables: {
          input: {
            clientMutationId: `remove-coupon-${Date.now()}`,
            codes: [code],
          },
        },
      })
      await syncCartFromLatestQuery()
      setCouponFeedback(`Gutscheincode ${code} wurde entfernt.`)
    } catch (error) {
      const message = error instanceof Error && error.message.trim()
        ? error.message.trim()
        : 'Der Gutscheincode konnte nicht entfernt werden.'
      setCouponError(message)
    }
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
  const appliedCoupons: IAppliedCoupon[] = data?.cart?.appliedCoupons ?? []
  const couponMutationLoading = couponApplying || couponRemoving
  const hasPendingExternalPayment = hasActivePendingExternalPayment(pendingExternalPayment)

  return (
    <ContentShell className="py-8 lg:py-12">
      <CheckoutSteps currentStep="payment" showChangeShipping />

      {submitError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      ) : null}
      {hasPendingExternalPayment ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Eine externe Zahlung wurde gestartet, aber noch nicht abgeschlossen. Deine Artikel bleiben im Checkout,
          bis die Bestellung erfolgreich beendet wurde.
          {restoreInFlight ? ' Der Warenkorb wird gerade aus deiner Checkout-Session wiederhergestellt.' : ''}
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

          <section className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6 shadow-[0_8px_24px_rgba(31,92,171,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#1F5CAB]">Gutscheincode</h2>
                <p className="mt-1 text-sm text-[#1F5CAB]/75">
                  Loesen Sie hier Ihren WooCommerce-Gutschein ein.
                </p>
              </div>
              {couponMutationLoading ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1F5CAB]">
                  Gutschein wird aktualisiert...
                </span>
              ) : null}
            </div>

            <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleApplyCoupon}>
              <input
                type="text"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="z. B. PLANENADLER10"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-[#B9D4F2] bg-white px-4 py-3 text-sm text-[#1F5CAB] outline-none transition placeholder:text-[#1F5CAB]/45 focus:border-[#1F5CAB] focus:ring-2 focus:ring-[#1F5CAB]/15"
                disabled={couponMutationLoading}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={couponMutationLoading}
              >
                Gutschein anwenden
              </button>
            </form>

            {couponError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                {couponError}
              </div>
            ) : null}
            {couponFeedback ? (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {couponFeedback}
              </div>
            ) : null}

            {appliedCoupons.length > 0 ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#1F5CAB]">Aktive Gutscheine</p>
                <ul className="mt-3 space-y-3">
                  {appliedCoupons.map((coupon) => (
                    <li
                      key={coupon.code}
                      className="flex flex-col gap-3 rounded-xl border border-[#DBE9F9] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1F5CAB]">
                          {coupon.code}
                        </p>
                        {coupon.description ? (
                          <p className="mt-1 text-sm text-[#1F5CAB]/75">{coupon.description}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          void handleRemoveCoupon(coupon.code)
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-[#B9D4F2] px-4 py-2 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#1F5CAB] hover:bg-[#F7FAFF] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={couponMutationLoading}
                      >
                        Entfernen
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

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
            <CardPaymentForm
              title="Apple Pay / Google Pay"
              introText="Wenn dein Browser oder Geraet Apple Pay oder Google Pay unterstuetzt, zeigt Stripe die passende Wallet-Option an."
              buttonLabel="Mit Wallet fortfahren"
              onContinue={() => {
                void handleProviderRedirect('card')
              }}
              isSubmitting={providerLoading === PAYMENT_METHOD_IDS.CARD}
              helperText={selectedGateway?.helperText}
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
