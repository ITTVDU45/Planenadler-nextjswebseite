'use client'

import Link from 'next/link'

const SHOP_PATH = '/shop'

export function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] px-6 py-16 text-center">
      <span
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#DBE9F9] text-[#1F5CAB]"
        aria-hidden
      >
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </span>
      <h2 className="text-xl font-bold text-[#1F5CAB]">
        Ihr Warenkorb ist leer
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[#1F5CAB]/80">
        Legen Sie Artikel aus dem Shop in den Warenkorb und kommen Sie hierher
        zurück, um zur Kasse zu gehen.
      </p>
      <Link
        href={SHOP_PATH}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
      >
        Zum Shop
      </Link>
    </div>
  )
}
