'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@apollo/client'
import { useCartStore } from '@/shared/lib/cartStore'
import { getFormattedCart, createCheckoutData } from '@/shared/lib/functions'
import { GET_CART } from '@/features/cart/api/queries'
import { CHECKOUT_MUTATION } from '@/shared/lib/GQL_MUTATIONS'
import { getWooCommercePaymentMethod } from '../services/payment.service'
import type { CheckoutShippingInput } from '../lib/checkoutSchema'
import type { ICheckoutDataProps } from '@/shared/types/checkout'
import { CheckoutSteps } from './CheckoutSteps'
import { CheckoutForm } from './CheckoutForm'
import { CheckoutOrderSummary } from './OrderSummary'
import { PaymentMethods } from './PaymentMethods'
import { useCheckoutStore } from '../store/checkout.store'
import { hasActivePendingExternalPayment } from '../store/checkout.store'
import { ContentShell } from '@/shared/components/ContentShell.component'

const CART_PATH = '/cart'

function toCheckoutDataProps(data: CheckoutShippingInput, paymentMethod: string): ICheckoutDataProps {
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

export function CheckoutContent() {
  const { cart, syncWithWooCommerce, clearWooCommerceSession } = useCartStore()
  const { currentStep, orderCompleted, setCurrentStep, setOrderCompleted, selectedPayment } = useCheckoutStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data } = useQuery(GET_CART, { notifyOnNetworkStatusChange: true })

  const [checkoutMutation, { loading: checkoutLoading }] = useMutation(CHECKOUT_MUTATION, {
    onCompleted: () => {
      setOrderCompleted(true)
      clearWooCommerceSession()
    },
    onError: (err) => {
      setSubmitError(err.message ?? 'Bestellung konnte nicht abgeschlossen werden.')
    },
  })

  const handleCheckoutSubmit = (formData: CheckoutShippingInput) => {
    setSubmitError(null)
    const wcPayment = getWooCommercePaymentMethod(selectedPayment)
    if (wcPayment !== 'bacs') {
      setSubmitError('Bitte wählen Sie Banküberweisung. Andere Zahlungsarten sind derzeit nicht verfügbar.')
      return
    }
    const orderProps = toCheckoutDataProps(formData, wcPayment)
    const input = createCheckoutData(orderProps)
    checkoutMutation({ variables: { input } })
  }

  useEffect(() => {
    if (!data) return
    const updatedCart = getFormattedCart(data)
    if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
      if (hasActivePendingExternalPayment(useCheckoutStore.getState().pendingExternalPayment)) return
      clearWooCommerceSession()
      return
    }
    if (updatedCart) syncWithWooCommerce(updatedCart)
  }, [data, clearWooCommerceSession, syncWithWooCommerce])

  const hasItems = (cart?.products?.length ?? 0) > 0

  if (!hasItems && !orderCompleted) {
    return (
      <ContentShell className="py-12">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <h2 className="text-xl font-bold text-[#1F5CAB]">Keine Artikel im Warenkorb</h2>
          <p className="mt-2 text-sm text-[#1F5CAB]/80">
            Legen Sie zuerst Artikel in den Warenkorb, um zur Kasse zu gehen.
          </p>
          <Link
            href={CART_PATH}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52]"
          >
            Zum Warenkorb
          </Link>
        </div>
      </ContentShell>
    )
  }

  if (orderCompleted) {
    return (
      <ContentShell className="py-12">
        <CheckoutSteps currentStep="order" />
        <div className="mt-8 rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <h2 className="text-2xl font-bold text-[#1F5CAB]">Vielen Dank für Ihre Bestellung</h2>
          <p className="mt-2 text-[#1F5CAB]/80">
            Sie erhalten in Kürze eine Bestätigung per E-Mail.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52]"
          >
            Zur Startseite
          </Link>
        </div>
      </ContentShell>
    )
  }

  return (
    <ContentShell className="py-8 lg:py-12">
      <CheckoutSteps currentStep={currentStep} />

      {submitError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="min-w-0">
          <CheckoutForm onValidSubmit={handleCheckoutSubmit} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary />
          <div className="mt-6">
            <PaymentMethods />
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={checkoutLoading}
            className="mt-6 hidden w-full rounded-full bg-[#1F5CAB] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] disabled:opacity-60 lg:block"
          >
            {checkoutLoading ? 'Wird verarbeitet…' : 'Jetzt bezahlen'}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:justify-end lg:gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(currentStep === 'payment' ? 'shipping' : 'payment')}
          className="hidden w-full rounded-full border-2 border-[#DBE9F9] bg-white py-3.5 text-sm font-semibold text-[#1F5CAB] transition hover:bg-[#F7FAFF] lg:inline-flex lg:max-w-[200px] lg:justify-center"
        >
          {currentStep === 'payment' ? 'Zurück' : 'Weiter zur Zahlung'}
        </button>
        <button
          type="submit"
          form="checkout-form"
          disabled={checkoutLoading}
          className="sticky bottom-20 z-10 w-full rounded-full bg-[#1F5CAB] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0F2B52] disabled:opacity-60 sm:bottom-4 lg:relative lg:bottom-0 lg:max-w-[240px]"
        >
          {checkoutLoading ? 'Wird verarbeitet…' : 'Jetzt bezahlen'}
        </button>
      </div>
    </ContentShell>
  )
}
