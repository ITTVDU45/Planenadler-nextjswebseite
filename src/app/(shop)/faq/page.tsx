import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { ABOUT_FAQ_ITEMS } from '@/features/about/data/faq'
import { buildFaqSchema } from '@/features/about/faqSchema'
import { FaqPageContent } from './FaqPageContent'
import { buildCanonicalMetadata } from '@/lib/seo'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = buildCanonicalMetadata(
  '/faq',
  'FAQ',
  'Antworten auf haeufige Fragen zu Lieferung, Materialien, Sondermassen und Befestigungsarten bei Planenadler.'
)

export default function FaqPage() {
  const faqSchema = buildFaqSchema(ABOUT_FAQ_ITEMS)
  const breadcrumbSchema = getBreadcrumbJsonLd([
    { name: 'Startseite', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-white pb-16 sm:pt-20">
        <TopBar />
        <section className="bg-[#F7FAFF] py-16 lg:py-24">
          <ContentShell>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3982DC]">
                FAQ
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#1F5CAB] sm:text-4xl">
                Antworten auf die haeufigsten Fragen
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#1F5CAB]/75 sm:text-base">
                Hier finden Sie die wichtigsten Antworten rund um Lieferung, Materialien,
                Sondermasse und die Konfiguration Ihrer Plane.
              </p>
            </div>
          </ContentShell>
        </section>
        <FaqPageContent items={ABOUT_FAQ_ITEMS} />
        <Footer />
      </main>
      <Stickynav />
    </>
  )
}
