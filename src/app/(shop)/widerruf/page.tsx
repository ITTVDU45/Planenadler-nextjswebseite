import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'

export const metadata: Metadata = {
  title: 'Widerrufsbelehrung | Planenadler',
  description:
    'Widerrufsrecht und Widerrufsbelehrung – Fristen, Folgen und Muster-Widerrufsformular.',
  openGraph: {
    title: 'Widerrufsbelehrung | Planenadler',
    description: 'Widerrufsrecht und Widerrufsformular.',
  },
}

const linkClass = 'underline hover:text-[#1F5CAB]'
const h2Class = 'text-lg font-semibold text-[#1F5CAB] mt-8 first:mt-6'

export default function WiderrufPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <article className="py-12" aria-label="Widerrufsbelehrung">
        <ContentShell className="max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
            Widerrufsbelehrung
          </h1>

          <div className="mt-8 space-y-4 text-[#1F5CAB]/90 text-sm leading-relaxed">
            <section>
              <h2 className={h2Class}>Widerrufsrecht</h2>
              <p>
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von
                Gründen diesen Vertrag zu widerrufen.
              </p>
              <p>
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie
                oder ein von Ihnen benannter Dritter, der nicht der Beförderer
                ist, die Waren in Besitz genommen haben bzw. hat.
              </p>
              <p>
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Planenadler,
                Ahmet Karadag, Düsseldorfer Str. 387, 47055 Duisburg, Telefon:
                0172 7436428, E-Mail:{' '}
                <a href="mailto:post@planenadler.de" className={linkClass}>
                  post@planenadler.de
                </a>
                ) mittels einer eindeutigen Erklärung (z. B. ein mit der Post
                versandter Brief oder E-Mail) über Ihren Entschluss, diesen
                Vertrag zu widerrufen, informieren. Sie können dafür das
                beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
                vorgeschrieben ist.
              </p>
              <p>
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die
                Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der
                Widerrufsfrist absenden.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Folgen des Widerrufs</h2>
              <p>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
                Zahlungen, die wir von Ihnen erhalten haben, einschließlich der
                Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich
                daraus ergeben, dass Sie eine andere Art der Lieferung als die von
                uns angebotene, günstigste Standardlieferung gewählt haben),
                unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
                zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses
                Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden
                wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen
                Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
                ausdrücklich etwas anderes vereinbart; in keinem Fall werden
                Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>
              <p>
                Wir können die Rückzahlung verweigern, bis wir die Waren wieder
                zurückerhalten haben oder bis Sie den Nachweis erbracht haben,
                dass Sie die Waren zurückgesandt haben, je nachdem, welches der
                frühere Zeitpunkt ist.
              </p>
              <p>
                Sie haben die Waren unverzüglich und in jedem Fall spätestens
                binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den
                Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder
                zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor
                Ablauf der Frist von vierzehn Tagen absenden.
              </p>
              <p>Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</p>
              <p>
                Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen,
                wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit,
                Eigenschaften und Funktionsweise der Waren nicht notwendigen
                Umgang mit ihnen zurückzuführen ist.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>
                Ausschluss des Widerrufsrechts bei verpackungsbedingten Falten
              </h2>
              <p>
                Bitte beachten Sie, dass alle unsere Planen gefaltet und nicht
                gerollt verpackt werden, um den Versand zu ermöglichen. Durch
                diese Faltung können leichte Falten und Knicke entstehen, die
                jedoch keinen Einfluss auf die Funktionalität der Plane haben. Ein
                Widerruf wegen solcher knickbedingter Beschwerden ist daher
                ausgeschlossen, da diese durch den Verpackungs- und
                Versandprozess unvermeidbar sind.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>
                Ausschluss des Widerrufsrechts bei individuell gefertigten Waren
              </h2>
              <p>
                Gemäß § 312g Abs. 2 Nr. 1 BGB besteht kein Widerrufsrecht bei
                Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und
                für deren Herstellung eine individuelle Auswahl oder Bestimmung
                durch den Verbraucher maßgeblich ist oder die eindeutig auf die
                persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind.
              </p>
              <p>
                Produktionsbedingte, handwerksübliche und technisch unvermeidbare
                geringfügige Abweichungen – insbesondere in Maßen (bis 2 cm),
                Farbe, Materialbeschaffenheit oder Verarbeitung – stellen daher
                keinen Mangel dar und begründen weder ein Widerrufs- noch ein
                Rückgaberecht.
              </p>
            </section>

            <section>
              <h2 className={h2Class}>Widerrufsformular</h2>
              <p>
                (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte
                dieses Formular aus und senden Sie es zurück.)
              </p>
              <p className="mt-2 font-normal">
                An: Ahmet Karadag, Planenadler, Düsseldorfer Str. 387, 47055
                Duisburg, E-Mail:{' '}
                <a href="mailto:post@planenadler.de" className={linkClass}>
                  post@planenadler.de
                </a>
              </p>
              <p className="mt-4">
                Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*)
                abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)
                mit der Bestellnummer: (*)
              </p>
              <p className="mt-2 border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">
                Bestellt am (*) / erhalten am (*)
              </p>
              <p className="mt-2 border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">Name des/der Verbraucher(s)</p>
              <p className="border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">Anschrift des/der Verbraucher(s)</p>
              <p className="border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">
                Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf
                Papier)
              </p>
              <p className="border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">Datum</p>
              <p className="border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-4 text-[#1F5CAB]/80">(*) Unzutreffendes streichen.</p>
            </section>
          </div>
        </ContentShell>
      </article>
      <Footer />
      <Stickynav />
    </main>
  )
}
