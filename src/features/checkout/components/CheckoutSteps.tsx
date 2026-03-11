'use client'

import Link from 'next/link'
import type { CheckoutStepId } from '../types/checkout.types'

const STEPS: { id: CheckoutStepId; label: string }[] = [
  { id: 'cart', label: 'Warenkorb' },
  { id: 'shipping', label: 'Versand' },
  { id: 'payment', label: 'Zahlung' },
  { id: 'order', label: 'Bestellung' },
]

const SHIPPING_PATH = '/checkout/shipping'
const CART_PATH = '/cart'

interface CheckoutStepsProps {
  currentStep: CheckoutStepId
  /** When true and currentStep is payment, the Shipping step is rendered as a link "Versand (Ändern)" to /checkout/shipping */
  showChangeShipping?: boolean
}

export function CheckoutSteps({ currentStep, showChangeShipping = false }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
  const progress = currentIndex < 0 ? 0 : ((currentIndex + 1) / STEPS.length) * 100

  return (
    <nav
      className="border-b border-[#DBE9F9] pb-6"
      aria-label="Checkout-Schritte"
    >
      <div
        className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#DBE9F9]"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Fortschritt"
      >
        <div
          className="h-full rounded-full bg-[#1F5CAB] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isPast = currentIndex > index
          const isFuture = currentIndex < index
          return (
            <div
              key={step.id}
              className="flex flex-1 items-center gap-2"
              aria-current={isActive ? 'step' : undefined}
              aria-disabled={isFuture ? 'true' : undefined}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#1F5CAB] ${
                  isActive
                    ? 'bg-[#1F5CAB] text-white'
                    : isPast
                      ? 'border-2 border-[#1F5CAB] bg-[#F7FAFF]'
                      : 'border-2 border-[#DBE9F9] bg-white text-[#1F5CAB]/50'
                }`}
              >
                {isPast ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </span>
              {step.id === 'shipping' && showChangeShipping && currentStep === 'payment' && isPast ? (
                <span className="hidden text-sm font-medium sm:inline sm:text-base text-[#1F5CAB]/80">
                  <Link href={SHIPPING_PATH} className="hover:text-[#1F5CAB] underline">
                    {step.label} (Ändern)
                  </Link>
                </span>
              ) : step.id === 'cart' && isPast ? (
                <Link
                  href={CART_PATH}
                  className={`hidden text-sm font-medium sm:inline sm:text-base ${
                    isPast ? 'text-[#1F5CAB]/80 hover:text-[#1F5CAB]' : 'text-[#1F5CAB]/50'
                  }`}
                >
                  {step.label}
                </Link>
              ) : (
                <span
                  className={`hidden text-sm font-medium sm:inline sm:text-base ${
                    isActive ? 'text-[#1F5CAB]' : isPast ? 'text-[#1F5CAB]/80' : 'text-[#1F5CAB]/50'
                  }`}
                >
                  {step.label}
                </span>
              )}
              {index < STEPS.length - 1 ? (
                <span className="ml-1 h-px flex-1 bg-[#DBE9F9] sm:ml-2" aria-hidden />
              ) : null}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
