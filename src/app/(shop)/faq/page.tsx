import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'
import { ABOUT_FAQ_SECTIONS } from '@/features/about/data/faq'
import { buildFaqSchema } from '@/features/about/faqSchema'
import { FaqPageContent } from './FaqPageContent'
import { buildCanonicalMetadata } from '@/lib/seo'
import { getBreadcrumbJsonLd } from '@/lib/seo-schema'

export const metadata: Metadata = buildCanonicalMetadata(
  '/faq',
  'FAQ',
  'Antworten auf haeufige Fragen zu Terrassenplanen, Poolabdeckungen, Versand, Zahlungen und Materialien bei Planenadler.'
)

export default function FaqPage() {
  const faqSchema = buildFaqSchema(ABOUT_FAQ_SECTIONS)
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
                Hier finden Sie gebuendelte Antworten rund um Produkte, Material,
                Versand, Zahlungen und Massanfertigungen bei Planenadler.
              </p>
            </div>
          </ContentShell>
        </section>
        <FaqPageContent sections={ABOUT_FAQ_SECTIONS} />
        <Footer />
      </main>
      <Stickynav />
    </>
  )
}
