import { Suspense } from 'react'
import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { PaymentPageContent } from '@/features/checkout/components/PaymentPageContent'
import { ContentShell } from '@/shared/components/ContentShell.component'

export const metadata: Metadata = {
  title: 'Zahlung | Kasse | Planenadler',
  description:
    'Zahlungsart wählen und Bestellung abschließen. Sichere Zahlung.',
  openGraph: {
    title: 'Zahlung | Kasse | Planenadler',
    description: 'Zahlungsart wählen und Bestellung abschließen.',
  },
}

export default function CheckoutPaymentPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <section className="min-h-[50vh]" aria-label="Zahlung">
        <Suspense
          fallback={
            <ContentShell className="py-12">
              <div className="rounded-2xl border border-[#DBE9F9] bg-[#F7FAFF] p-8 text-center">
                <p className="text-[#1F5CAB]/90">Lade...</p>
              </div>
            </ContentShell>
          }
        >
          <PaymentPageContent />
        </Suspense>
      </section>
      <Footer />
      <Stickynav />
    </main>
  )
}
