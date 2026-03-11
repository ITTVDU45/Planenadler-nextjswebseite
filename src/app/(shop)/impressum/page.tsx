import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'

export const metadata: Metadata = {
  title: 'Impressum | Planenadler',
  description: 'Impressum und rechtliche Angaben – Planenadler, Düsseldorfer Str. 387, 47055 Duisburg.',
  openGraph: {
    title: 'Impressum | Planenadler',
    description: 'Impressum und rechtliche Angaben.',
  },
}

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <article className="py-12" aria-label="Impressum">
        <ContentShell className="max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
            Impressum
          </h1>

          <div className="mt-8 space-y-6 text-[#1F5CAB]/90">
            <section>
              <h2 className="text-lg font-semibold text-[#1F5CAB]">
                Angaben gemäß § 5 TMG
              </h2>
              <p className="mt-2">
                Ahmet Karadag
                <br />
                Planendienstleister
                <br />
                Düsseldorfer Str. 387
                <br />
                47055 Duisburg
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1F5CAB]">
                Kontakt
              </h2>
              <p className="mt-2">
                Telefon: 0203 7385985
                <br />
                E-Mail:{' '}
                <a
                  href="mailto:post@planenadler.de"
                  className="underline hover:text-[#1F5CAB]"
                >
                  post@planenadler.de
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1F5CAB]">
                EU-Streitschlichtung
              </h2>
              <p className="mt-2">
                Die Europäische Kommission stellt eine Plattform zur
                Online-Streitbeilegung (OS) bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#1F5CAB]"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1F5CAB]">
                Verbraucherstreitbeilegung / Universalschlichtungsstelle
              </h2>
              <p className="mt-2">
                Wir sind nicht bereit oder verpflichtet, an
                Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#1F5CAB]">
                Alternative Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO und §
                36 VSBG
              </h2>
              <p className="mt-2">
                Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle sind wir nicht verpflichtet und
                nicht bereit.
              </p>
            </section>

            <p className="mt-8 text-sm text-[#1F5CAB]/70">
              Quelle:{' '}
              <a
                href="https://www.e-recht24.de"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#1F5CAB]"
              >
                https://www.e-recht24.de
              </a>
            </p>
          </div>
        </ContentShell>
      </article>
      <Footer />
      <Stickynav />
    </main>
  )
}
