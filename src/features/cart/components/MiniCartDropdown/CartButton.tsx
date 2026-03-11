'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/shared/lib/cartStore'

type CartButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function CartButton({ className, ...props }: CartButtonProps) {
  const count = useCartStore((state) => state.cart?.totalProductsCount ?? state.cart?.products?.length ?? 0)

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-full border border-[#DBE9F9] bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#1F5CAB] transition hover:-translate-y-0.5 hover:bg-[#DBE9F9]',
        className,
      )}
      {...props}
    >
      <svg width="14" height="16" viewBox="0 0 20 22" fill="none" aria-hidden>
        <path d="M2.5 7h15l-1.6 12.5H4.1L2.5 7Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="hidden xl:inline">Warenkorb</span>
      {count > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#1F5CAB] px-1.5 text-[10px] leading-5 text-white">
          {count}
        </span>
      ) : null}
    </button>
  )
}
