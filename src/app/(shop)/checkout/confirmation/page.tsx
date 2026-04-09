import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { CheckoutConfirmationContent } from '@/features/checkout/components/CheckoutConfirmationContent'

export const metadata: Metadata = {
  title: 'Bestellbestätigung | Kasse | Planenadler',
  description:
    'Ihre Bestellung bei Planenadler wurde entgegengenommen. Sie erhalten eine Bestätigung per E-Mail.',
  openGraph: {
    title: 'Bestellbestätigung | Planenadler',
    description: 'Vielen Dank für Ihre Bestellung.',
  },
  robots: { index: false, follow: false },
}

export default function CheckoutConfirmationPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <section className="min-h-[50vh]" aria-label="Bestellbestätigung">
        <CheckoutConfirmationContent />
      </section>
      <Footer />
      <Stickynav />
    </main>
  )
}
