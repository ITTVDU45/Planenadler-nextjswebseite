'use client'

const DEFAULT_IBAN = 'DE89 3704 0044 0532 0130 00'

interface BankTransferPanelProps {
  reference?: string
  onPlaceOrder: () => void
  isSubmitting: boolean
}

export function BankTransferPanel({
  reference = 'Bestellung',
  onPlaceOrder,
  isSubmitting,
}: BankTransferPanelProps) {
  return (
    <div className="mt-4 rounded-xl border border-[#DBE9F9] bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-[#1F5CAB]">Direkte Banküberweisung</h3>
      <div className="space-y-3 text-sm text-[#1F5CAB]/90">
        <p>
          <span className="font-medium">IBAN:</span>{' '}
          <span className="font-mono tracking-wide">{DEFAULT_IBAN}</span>
        </p>
        <p>
          <span className="font-medium">Verwendungszweck:</span> {reference}
        </p>
        <p className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-amber-900">
          Versand erfolgt nach Zahlungseingang.
        </p>
      </div>
      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={isSubmitting}
        className="mt-6 w-full rounded-full bg-[#1F5CAB] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2B52] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#1F5CAB] focus:ring-offset-2"
      >
        {isSubmitting ? 'Wird verarbeitet…' : 'Bestellung abschließen'}
      </button>
    </div>
  )
}
