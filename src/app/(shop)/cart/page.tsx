import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { CartPageContent } from '@/features/cart/components/CartPageContent'
import { NOINDEX_ROBOTS, absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Warenkorb | Planenadler',
  description:
    'Ihr Warenkorb - Artikel pruefen und zur Kasse gehen. Massgeschneiderte Planen und Abdeckungen.',
  alternates: {
    canonical: absoluteUrl('/cart'),
  },
  robots: NOINDEX_ROBOTS,
  openGraph: {
    title: 'Warenkorb | Planenadler',
    description: 'Ihr Warenkorb - Artikel pruefen und zur Kasse gehen.',
    url: absoluteUrl('/cart'),
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
