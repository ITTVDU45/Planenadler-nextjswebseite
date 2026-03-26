'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/shared/lib/cartStore'
import { decodePriceDisplay, getAbsoluteImageUrl } from '@/shared/lib/functions'
import { CartButton } from './CartButton'

const MAX_ITEMS = 5
const CART_PATH = '/cart'
const CHECKOUT_PATH = '/checkout/shipping'
const SHOP_PATH = '/shop'

export function MiniCartDropdown() {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const cart = useCartStore((state) => state.cart)
  const products = cart?.products ?? []
  const displayItems = products.slice(0, MAX_ITEMS)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <CartButton
        aria-expanded={false}
        aria-haspopup="dialog"
        id="cart-button"
      />
    )
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <CartButton
          aria-expanded={open}
          aria-haspopup="dialog"
          id="cart-button"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[100] w-[min(100vw-2rem,380px)] rounded-2xl border border-[#DBE9F9] bg-white p-4 shadow-[0_16px_40px_rgba(15,43,82,0.12)] focus:outline-none"
          sideOffset={8}
          align="end"
          aria-label="Warenkorb-Vorschau"
          onCloseAutoFocus={(e) => {
            const trigger = document.getElementById('cart-button')
            if (trigger && !e.defaultPrevented) trigger.focus()
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#1F5CAB]">
              Warenkorb {products.length > 0 ? `(${cart?.totalProductsCount})` : ''}
            </h3>
            {products.length > 0 ? (
              <Link
                href={CART_PATH}
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[#3982DC] hover:underline"
              >
                Warenkorb anzeigen
              </Link>
            ) : null}
          </div>

          {displayItems.length > 0 ? (
            <>
              <ul className="max-h-[280px] space-y-3 overflow-y-auto">
                {displayItems.map((item) => (
                  <li
                    key={item.cartKey}
                    className="flex gap-3 rounded-lg border border-[#DBE9F9] bg-[#F7FAFF] p-2"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#DBE9F9]">
                      <Image
                        src={
                          item.image?.sourceUrl
                            ? getAbsoluteImageUrl(item.image.sourceUrl)
                            : '/placeholder.png'
                        }
                        alt={item.image?.title ?? item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1F5CAB]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#1F5CAB]/70">
                        {item.qty} &times; {decodePriceDisplay(item.unitPriceDisplay)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2 border-t border-[#DBE9F9] pt-4">
                <Link
                  href={CART_PATH}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F2B52]"
                >
                  Zum Warenkorb
                </Link>
                <Link
                  href={CHECKOUT_PATH}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-[#DBE9F9] px-4 py-2.5 text-sm font-semibold text-[#1F5CAB] transition hover:bg-[#F7FAFF]"
                >
                  Zur Kasse
                </Link>
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-[#1F5CAB]/80">
                Ihr Warenkorb ist leer
              </p>
              <Link
                href={SHOP_PATH}
                onClick={() => setOpen(false)}
                className="mt-3 inline-block text-sm font-semibold text-[#3982DC] hover:underline"
              >
                Zum Shop
              </Link>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
