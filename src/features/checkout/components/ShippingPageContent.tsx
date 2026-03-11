'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { useCartStore } from '@/shared/lib/cartStore'
import { getFormattedCart } from '@/shared/lib/functions'
import { GET_CART } from '@/features/cart/api/queries'
import { useCheckoutStore } from '../store/checkout.store'
import { CheckoutSteps } from './CheckoutSteps'
import { ShippingForm } from './ShippingForm'
import { CheckoutOrderSummary } from './OrderSummary'
import { ContentShell } from '@/shared/components/ContentShell.component'
import type { CheckoutShippingInput } from '../lib/checkoutSchema'

const CART_PATH = '/cart'
const PAYMENT_PATH = '/checkout/payment'

export function ShippingPageContent() {
  const router = useRouter()
  const { cart, syncWithWooCommerce, clearWooCommerceSession } = useCartStore()
  const { shippingData, setShippingData, setSelectedShipping } = useCheckoutStore()

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

  const hasItems = (cart?.products?.length ?? 0) > 0

  const handleValidSubmit = (formData: CheckoutShippingInput) => {
    setShippingData(formData)
    setSelectedShipping(formData.shippingMethod)
    router.push(PAYMENT_PATH)
  }

  if (!hasItems) {
    return (
      <ContentShell className="py-12">
        <CheckoutSteps currentStep="shipping" />
        <div className="mt-8 rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
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

  return (
    <ContentShell className="py-8 lg:py-12">
      <CheckoutSteps currentStep="shipping" showChangeShipping={false} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <div className="min-w-0">
          <ShippingForm
          initialData={shippingData ?? undefined}
          onValidSubmit={handleValidSubmit}
          submitLabel="Weiter zur Zahlung"
        />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutOrderSummary />
        </div>
      </div>
    </ContentShell>
  )
}
