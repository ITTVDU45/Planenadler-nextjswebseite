'use client'

import Link from 'next/link'

export type CartStepId = 'cart' | 'checkout' | 'order'

interface CartStepsProps {
  currentStep: CartStepId
}

const CHECKOUT_PATH = '/checkout/shipping'

export function CartSteps({ currentStep }: CartStepsProps) {
  return (
    <nav
      className="border-b border-[#DBE9F9] pb-6"
      aria-label="Checkout-Schritte"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F5CAB] text-white"
            aria-current={currentStep === 'cart' ? 'step' : undefined}
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold text-[#1F5CAB] sm:text-base">
            Warenkorb
          </span>
        </div>

        <span className="h-px w-6 bg-[#DBE9F9] sm:w-12" aria-hidden />

        <div className="flex items-center gap-2">
          {currentStep === 'cart' ? (
            <Link
              href={CHECKOUT_PATH}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#DBE9F9] text-[#1F5CAB]/70 transition hover:border-[#1F5CAB] hover:text-[#1F5CAB]"
              aria-label="Zur Kasse"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </Link>
          ) : (
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#DBE9F9] text-[#1F5CAB]/50"
              aria-disabled="true"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </span>
          )}
          <span className="text-sm font-medium text-[#1F5CAB]/70 sm:text-base">
            Kasse
          </span>
        </div>

        <span className="h-px w-6 bg-[#DBE9F9] sm:w-12" aria-hidden />

        <div className="flex items-center gap-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#DBE9F9] bg-[#F7FAFF] text-[#1F5CAB]/40"
            aria-disabled="true"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span className="text-sm text-[#1F5CAB]/50 sm:text-base">
            Bestellung
          </span>
        </div>
      </div>
    </nav>
  )
}
