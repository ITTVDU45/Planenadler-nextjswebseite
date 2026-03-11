import type { Metadata } from 'next'
import Link from 'next/link'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'

export const metadata: Metadata = {
  title: 'Versand- & Lieferbedingungen | Planenadler',
  description:
    'Versand- und Lieferbedingungen – Verpackung, Versandkosten, Lieferzeiten und Widerrufsrecht.',
  openGraph: {
    title: 'Versand- & Lieferbedingungen | Planenadler',
    description: 'Versand- und Lieferbedingungen.',
  },
}

const linkClass = 'underline hover:text-[#1F5CAB]'
const h2Class = 'text-lg font-semibold text-[#1F5CAB] mt-8 first:mt-6'

export default function VersandPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <article className="py-12" aria-label="Versand- und Lieferbedingungen">
        <ContentShell className="max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
            Versand- & Lieferbedingungen
          </h1>
          <p className="mt-2 text-sm text-[#1F5CAB]/70">
            Letzte Aktualisierung: 4. Oktober 2024
          </p>

          <div className="mt-8 space-y-4 text-[#1F5CAB]/90 text-sm leading-relaxed">
            <p>
              Diese Versand- und Lieferbedingungen sind Teil unserer{' '}
              <Link href="/agb" className={linkClass}>
                AGB
              </Link>{' '}
              und sollten daher zusammen mit unseren Hauptbedingungen gelesen
              werden. Bitte lesen Sie auch unsere{' '}
              <Link href="/datenschutz" className={linkClass}>
                Datenschutzerklärung
              </Link>
              .
            </p>
            <p>
              Bitte lesen Sie unsere Versand- und Lieferbedingungen sorgfältig
              durch, wenn Sie unsere Produkte kaufen. Diese Bedingungen gelten
              für jede Bestellung, die Sie bei uns aufgeben.
            </p>

            <section>
              <h2 className={h2Class}>
                Welche Versand- & Lieferoptionen habe ich?
              </h2>

              <h3 className="text-base font-semibold text-[#1F5CAB] mt-6">
                Verpackung der Planen
              </h3>
              <p>
                Um unsere Produkte effizient zu verpacken, falten wir alle
                Planen, bevor sie versandt werden. Bitte beachten Sie, dass die
                Planen nicht gerollt, sondern gefaltet in die Pakete gelegt
                werden. Daher kann es zu leichten Knicken oder Falten in der
                Plane kommen, die durch die Faltung entstehen.
              </p>
              <p>
                Wir schließen einen Widerruf aufgrund von Knickbeschwerden
                ausdrücklich aus, da diese Falten durch den Versandprozess
                unvermeidlich sind und die Funktionalität der Plane nicht
                beeinträchtigen. Weitere Informationen dazu finden Sie in
                unserer{' '}
                <Link href="/widerruf" className={linkClass}>
                  Widerrufsbelehrung
                </Link>
                .
              </p>

              <h3 className="text-base font-semibold text-[#1F5CAB] mt-6">
                Versandkosten
              </h3>
              <p>
                Wir bieten Versand zu den folgenden Tarifen an:
              </p>
              <p>
                Alle Zeiten und Daten für die Lieferung der Produkte werden nach
                bestem Wissen angegeben, sind jedoch nur Schätzungen.
              </p>
              <p>
                Für EU- und UK-Verbraucher: Dies beeinträchtigt nicht Ihre
                gesetzlichen Rechte. Sofern nicht ausdrücklich anders angegeben,
                spiegeln die geschätzten Lieferzeiten die frühestmögliche
                verfügbare Lieferung wider, und Lieferungen erfolgen innerhalb von
                30 Tagen nach dem Tag, an dem wir Ihre Bestellung akzeptieren.
                Weitere Informationen finden Sie in unseren{' '}
                <Link href="/agb" className={linkClass}>
                  AGB
                </Link>
                .
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <strong>9 €</strong> für Bestellungen mit einem Gesamtgewicht
                  von weniger als 30 kg
                </li>
                <li>
                  <strong>80 €</strong> für Bestellungen mit einem Gesamtgewicht
                  von 30 kg oder mehr
                </li>
              </ul>
              <p className="mt-2">
                (Für Lieferungen innerhalb Deutschlands berechnen wir die
                Versandkosten nach Gewicht.)
              </p>

              <h3 className="text-base font-semibold text-[#1F5CAB] mt-6">
                Widerrufsrecht
              </h3>
              <p>
                Sie haben das Recht, innerhalb von 14 Tagen ohne Angabe von
                Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt
                14 Tage ab dem Tag, an dem Sie die Ware erhalten haben. Um Ihr
                Widerrufsrecht auszuüben, senden Sie uns bitte eine eindeutige
                Erklärung (z. B. per E-Mail oder Post) über Ihren Entschluss, den
                Vertrag zu widerrufen.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Liefern Sie international?</h2>
              <p>Wir bieten keinen internationalen Versand an.</p>
            </section>

            <section>
              <h2 className={h2Class}>
                Was passiert, wenn meine Bestellung verspätet ist?
              </h2>
              <p>
                Wenn sich die Lieferung aus irgendeinem Grund verzögert, werden
                wir Sie so schnell wie möglich informieren und Ihnen ein neues
                voraussichtliches Lieferdatum mitteilen.
              </p>
              <p>
                Für EU- und UK-Verbraucher: Dies beeinträchtigt nicht Ihre
                gesetzlichen Rechte. Weitere Informationen finden Sie in unseren{' '}
                <Link href="/agb" className={linkClass}>
                  AGB
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className={h2Class}>
                Wie können Sie uns zu dieser Richtlinie kontaktieren?
              </h2>
              <p>
                Wenn Sie Fragen oder Anmerkungen haben, können Sie uns
                kontaktieren unter:
              </p>
              <p className="mt-2">
                Telefon: 0172 7436428
                <br />
                E-Mail:{' '}
                <a href="mailto:post@planenadler.de" className={linkClass}>
                  post@planenadler.de
                </a>
              </p>
            </section>
          </div>
        </ContentShell>
      </article>
      <Footer />
      <Stickynav />
    </main>
  )
}
