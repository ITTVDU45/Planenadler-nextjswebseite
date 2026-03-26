'use client'

import Link from 'next/link'

interface AddToCartSuccessModalProps {
  open: boolean
  productName: string
  onClose: () => void
}

const CART_PATH = '/cart'

export function AddToCartSuccessModal({
  open,
  productName,
  onClose,
}: AddToCartSuccessModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-[#0F2B52]/45 px-4 py-6" role="dialog" aria-modal="true" aria-label="Produkt zum Warenkorb hinzugefuegt">
      <div className="w-full max-w-md rounded-3xl border border-[#D7E6F8] bg-white p-6 shadow-[0_22px_50px_rgba(15,43,82,0.24)]">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-600">
          Erfolgreich hinzugefuegt
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#0F2B52]">{productName}</h2>
        <p className="mt-3 text-sm text-[#1F5CAB]/80">
          Der Artikel wurde in Ihren Warenkorb gelegt.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-[#D7E6F8] bg-white px-5 py-3 text-sm font-semibold text-[#1F5CAB] transition hover:border-[#1F5CAB] hover:bg-[#F7FAFF]"
          >
            Weiter einkaufen
          </button>
          <Link
            href={CART_PATH}
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-[#1F5CAB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2B52]"
          >
            Zum Warenkorb
          </Link>
        </div>
      </div>
    </div>
  )
}
