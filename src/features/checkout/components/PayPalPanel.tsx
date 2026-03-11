'use client'

interface PayPalPanelProps {
  onContinue: () => void
  isSubmitting: boolean
}

export function PayPalPanel({ onContinue, isSubmitting }: PayPalPanelProps) {
  return (
    <div className="mt-4 rounded-xl border border-[#DBE9F9] bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-[#1F5CAB]">PayPal</h3>
      <p className="mb-4 text-sm text-[#1F5CAB]/90">
        Du wirst zu PayPal weitergeleitet, um die Zahlung abzuschließen.
      </p>
      <button
        type="button"
        onClick={onContinue}
        disabled={isSubmitting}
        className="w-full rounded-full border-2 border-[#DBE9F9] bg-[#F7FAFF] px-6 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#B9D4F3] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto lg:min-w-[200px]"
      >
        {isSubmitting ? 'Weiterleitung…' : 'Mit PayPal fortfahren'}
      </button>
    </div>
  )
}
