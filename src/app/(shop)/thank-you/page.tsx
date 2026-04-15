import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { OrderThankYouContent } from '@/features/checkout/components/OrderThankYouContent'

export const metadata: Metadata = {
  title: 'Bestellung erhalten | Planenadler',
  description:
    'Vielen Dank für deine Bestellung bei Planenadler. Hier findest du eine Zusammenfassung deiner Bestellung.',
  openGraph: {
    title: 'Bestellung erhalten | Planenadler',
    description: 'Deine Bestellung ist eingegangen.',
  },
  robots: { index: false, follow: false },
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <section className="min-h-[50vh]" aria-label="Bestellbestätigung">
        <OrderThankYouContent />
      </section>
      <Footer />
      <Stickynav />
    </main>
  )
}
