import type { Metadata } from 'next'
import Link from 'next/link'
import { AddPaymentMethodContent } from '@/features/auth/components/AddPaymentMethodContent'

export const metadata: Metadata = {
  title: 'Zahlungsmethode hinzufügen | Mein Konto | Planenadler',
  description: 'Fügen Sie eine Zahlungsmethode zu Ihrem Konto hinzu.',
}

export default function ZahlungsmethodeHinzufuegenPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/mein-konto/zahlungsmethoden"
          className="text-[#1F5CAB] hover:underline"
        >
          ← Zurück zu Zahlungsmethoden
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
        Zahlungsmethode hinzufügen
      </h1>
      <p className="text-[#1F5CAB]/80">
        Wählen Sie eine Zahlungsart. Karte können Sie direkt hier erfassen; bei
        Klarna und PayPal werden Sie zur sicheren Seite des Anbieters
        weitergeleitet und danach hierher zurückgeführt.
      </p>

      <AddPaymentMethodContent />

      <p className="text-sm text-[#1F5CAB]/70">
        Die Zahlungsdaten werden ausschließlich vom Shop und den zertifizierten
        Zahlungsanbietern verarbeitet.
      </p>
    </div>
  )
}
