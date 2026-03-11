import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { CartPageContent } from '@/features/cart/components/CartPageContent'

export const metadata: Metadata = {
  title: 'Warenkorb | Planenadler',
  description:
    'Ihr Warenkorb – Artikel prüfen und zur Kasse gehen. Maßgeschneiderte Planen und Abdeckungen.',
  openGraph: {
    title: 'Warenkorb | Planenadler',
    description: 'Ihr Warenkorb – Artikel prüfen und zur Kasse gehen.',
  },
}

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white pb-16 sm:pt-20">
      <TopBar />
      <section className="min-h-[50vh]" aria-label="Warenkorb">
        <CartPageContent />
      </section>
      <Footer />
      <Stickynav />
    </main>
  )
}
