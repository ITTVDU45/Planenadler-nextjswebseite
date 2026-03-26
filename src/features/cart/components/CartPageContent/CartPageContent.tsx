'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { useCartStore } from '@/shared/lib/cartStore'
import {
  decodePriceDisplay,
  getAbsoluteImageUrl,
  getFormattedCart,
  getUpdatedItems,
  type IProductRootObject,
} from '@/shared/lib/functions'
import { GET_CART } from '../../api/queries'
import { UPDATE_CART } from '@/shared/lib/GQL_MUTATIONS'
import { OrderSummary } from '../OrderSummary/OrderSummary'
import { useCheckoutStore } from '@/features/checkout/store/checkout.store'
import { PAYMENT_METHOD_IDS, type PaymentMethodId } from '@/features/checkout/types/checkout.types'
import { usePaymentOptions } from '@/features/checkout/hooks/usePaymentOptions'
import { ExpressCheckout } from '@/features/checkout/components/ExpressCheckout'
import { ContentShell } from '@/shared/components/ContentShell.component'

const SHIPPING_PATH = '/checkout/shipping'
const PAYMENT_PATH = '/checkout/payment'
const SHOP_PATH = '/shop'

export function CartPageContent() {
  const router = useRouter()
  const { cart, syncWithWooCommerce, clearWooCommerceSession } = useCartStore()
  const { shippingData, setSelectedPayment } = useCheckoutStore()
  const {
    data: paymentOptions,
    loading: paymentOptionsLoading,
    error: paymentOptionsError,
    refresh: refreshPaymentOptions,
  } = usePaymentOptions()

  const { data, refetch, loading } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
  })

  useEffect(() => {
    if (!data) return
    const updatedCart = getFormattedCart(data)
    if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
      clearWooCommerceSession()
      return
    }
    if (updatedCart) syncWithWooCommerce(updatedCart)
  }, [data, clearWooCommerceSession, syncWithWooCommerce])

  const [updateCart, { loading: updateCartLoading }] = useMutation(UPDATE_CART, {
    onCompleted: () => {
      void refetch()
    },
  })

  const handleQuantityUpdate = async (cartKey: string, quantity: number) => {
    const products = (data?.cart?.contents?.nodes ?? []) as IProductRootObject[]
    if (!products.length) return

    const nextQuantity = Math.max(0, quantity)
    const items = getUpdatedItems(products, nextQuantity, cartKey)
    await updateCart({
      variables: {
        input: {
          clientMutationId: uuidv4(),
          items,
        },
      },
    })
  }

  const handleExpressActivation = (gatewayId: PaymentMethodId) => {
    setSelectedPayment(gatewayId)
    router.push(shippingData ? PAYMENT_PATH : SHIPPING_PATH)
  }

  const products = cart?.products ?? []
  const hasItems = products.length > 0
  const cartTotals = cart?.totals ?? {
    subtotal: '0,00 €',
    subtotalTax: '0,00 €',
    shippingTax: '0,00 €',
    shippingTotal: '0,00 €',
    total: '0,00 €',
    totalTax: '0,00 €',
    feeTax: '0,00 €',
    feeTotal: '0,00 €',
    discountTax: '0,00 €',
    discountTotal: '0,00 €',
  }

  if (!hasItems && !loading) {
    return (
      <ContentShell className="py-12">
        <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1F5CAB]">Ihr Warenkorb ist leer</h1>
          <p className="mt-2 text-sm text-[#1F5CAB]/80">
            Legen Sie zuerst Produkte in den Warenkorb, bevor Sie den Express Checkout starten.
          </p>
          <Link
            href={SHOP_PATH}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52]"
          >
            Zum Shop
          </Link>
        </div>
      </ContentShell>
    )
  }

  return (
    <ContentShell className="py-8 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1F5CAB]">Warenkorb</h1>
                <p className="mt-1 text-sm text-[#1F5CAB]/75">
                  Pruefen Sie Ihre Artikel und starten Sie danach den Checkout.
                </p>
              </div>
              {updateCartLoading ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1F5CAB]">
                  Warenkorb wird aktualisiert...
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              {((data?.cart?.contents?.nodes ?? []) as IProductRootObject[]).map((item) => {
                const product = item.product.node
                const cartProduct = products.find((entry) => entry.cartKey === item.key)
                const imageUrl = product.image?.sourceUrl
                  ? getAbsoluteImageUrl(product.image.sourceUrl)
                  : '/placeholder.png'

                return (
                  <article
                    key={item.key}
                    className="grid gap-4 rounded-2xl border border-[#DBE9F9] bg-white p-4 md:grid-cols-[96px_minmax(0,1fr)_120px]"
                  >
                    <div className="relative h-24 overflow-hidden rounded-xl bg-[#DBE9F9]">
                      <Image
                        src={imageUrl}
                        alt={product.image?.title ?? product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-[#1F5CAB]">{product.name}</h2>
                      <p className="mt-1 text-sm text-[#1F5CAB]/70">
                        Artikelpreis: {decodePriceDisplay(cartProduct?.unitPriceDisplay ?? product.price ?? item.subtotal)}
                      </p>
                      {cartProduct?.configurationSummary?.length ? (
                        <dl className="mt-3 grid gap-1 rounded-xl bg-[#F7FAFF] p-3 text-xs text-[#1F5CAB]/85">
                          {cartProduct.configurationSummary.map((entry) => (
                              <div key={`${item.key}-${entry.label}`} className="flex justify-between gap-3">
                                <dt className="font-semibold text-[#1F5CAB]">{entry.label}</dt>
                                <dd className="text-right">{entry.value}</dd>
                              </div>
                            ))}
                        </dl>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <label className="text-sm text-[#1F5CAB]">
                          Menge
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(event) => {
                              const nextQuantity = Number.parseInt(event.target.value, 10)
                              if (!Number.isFinite(nextQuantity)) return
                              void handleQuantityUpdate(item.key, nextQuantity)
                            }}
                            className="ml-3 w-20 rounded-xl border border-[#DBE9F9] px-3 py-2 text-[#1F5CAB] focus:border-[#1F5CAB] focus:outline-none"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            void handleQuantityUpdate(item.key, 0)
                          }}
                          className="rounded-full border border-[#DBE9F9] px-4 py-2 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#1F5CAB] hover:bg-[#F7FAFF]"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3 md:flex-col md:items-end">
                      <p className="text-lg font-bold text-[#1F5CAB]">{decodePriceDisplay(item.subtotal)}</p>
                      {cartProduct?.hasConfiguration ? (
                        <p className="text-sm text-[#1F5CAB]/65">inkl. Konfiguration</p>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <ExpressCheckout
            title="Express Buttons"
            subtitle="Starten Sie direkt mit PayPal, Klarna oder Ihrer bevorzugten Zahlungsart."
            gateways={paymentOptions?.gateways ?? []}
            loading={paymentOptionsLoading}
            error={paymentOptionsError}
            context="cart"
            onActivateGateway={handleExpressActivation}
            onRefresh={refreshPaymentOptions}
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary totals={cartTotals} />
        </div>
      </div>
    </ContentShell>
  )
}
