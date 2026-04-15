'use client'

interface CardPaymentFormProps {
  title?: string
  introText?: string
  buttonLabel?: string
  onContinue: () => void
  isSubmitting: boolean
  helperText?: string
}

export function CardPaymentForm({
  title = 'Kartenzahlung',
  introText = 'Deine Bestellung wird an den sicheren Stripe-Zahlungsdialog weitergeleitet.',
  buttonLabel = 'Mit Karte fortfahren',
  onContinue,
  isSubmitting,
  helperText,
}: CardPaymentFormProps) {
  return (
    <div className="mt-4 rounded-xl border border-[#DBE9F9] bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-[#1F5CAB]">{title}</h3>
      <p className="mb-4 text-sm text-[#1F5CAB]/90">
        {introText}
      </p>
      {helperText ? (
        <div className="mb-4 rounded-lg border border-[#DBE9F9] bg-[#F7FAFF] p-4 text-sm text-[#1F5CAB]/85">
          {helperText}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onContinue}
        disabled={isSubmitting}
        className="w-full rounded-full border-2 border-[#DBE9F9] bg-[#F7FAFF] px-6 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#B9D4F3] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto lg:min-w-[240px]"
      >
        {isSubmitting ? 'Weiterleitung…' : buttonLabel}
      </button>
    </div>
  )
}
