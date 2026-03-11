'use client'

import Image from 'next/image'
import type { CartProduct } from '@/shared/types/cart'
import { getAbsoluteImageUrl } from '@/shared/lib/functions'
import { formatPrice } from '../../services/cartCalculations'

interface CartItemCardProps {
  item: CartProduct
  onQtyChange: (cartKey: string, newQty: number) => void
  onRemove: (cartKey: string) => void
  isUpdating?: boolean
}

export function CartItemCard({
  item,
  onQtyChange,
  onRemove,
  isUpdating = false,
}: CartItemCardProps) {
  const imgSrc =
    item.image?.sourceUrl != null
      ? getAbsoluteImageUrl(item.image.sourceUrl)
      : '/placeholder.png'

  const lineTotal = item.price * item.qty

  return (
    <div
      className="flex flex-col gap-4 border-b border-[#DBE9F9] py-4 last:border-b-0 sm:flex-row sm:items-center"
      data-testid="cart-item-card"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F7FAFF] sm:h-28 sm:w-28">
        <Image
          src={imgSrc}
          alt={item.image?.title ?? item.name}
          fill
          className="object-cover"
          sizes="112px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[#1F5CAB]">{item.name}</h3>
        {item.variant ? (
          <p className="mt-0.5 text-sm text-[#1F5CAB]/70">{item.variant}</p>
        ) : null}
        <p className="mt-1 text-sm text-[#1F5CAB]/70">
          {formatPrice(item.price)} &times; {item.qty}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center rounded-lg border border-[#DBE9F9] bg-white">
          <button
            type="button"
            onClick={() => onQtyChange(item.cartKey, Math.max(1, item.qty - 1))}
            disabled={isUpdating || item.qty <= 1}
            className="flex h-9 w-9 items-center justify-center text-[#1F5CAB] transition hover:bg-[#DBE9F9] disabled:opacity-50"
            aria-label="Menge verringern"
          >
            <span className="text-lg leading-none">−</span>
          </button>
          <span
            className="min-w-[2rem] px-2 text-center text-sm font-medium text-[#1F5CAB]"
            aria-live="polite"
          >
            {item.qty}
          </span>
          <button
            type="button"
            onClick={() => onQtyChange(item.cartKey, item.qty + 1)}
            disabled={isUpdating}
            className="flex h-9 w-9 items-center justify-center text-[#1F5CAB] transition hover:bg-[#DBE9F9] disabled:opacity-50"
            aria-label="Menge erhöhen"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
        <p className="w-20 text-right text-sm font-semibold text-[#1F5CAB] sm:text-base">
          {formatPrice(lineTotal)}
        </p>
        <button
          type="button"
          onClick={() => onRemove(item.cartKey)}
          disabled={isUpdating}
          className="rounded-lg p-2 text-[#1F5CAB]/70 transition hover:bg-[#DBE9F9] hover:text-[#1F5CAB] disabled:opacity-50"
          aria-label="Artikel entfernen"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
