import type { Metadata } from 'next'
import { TopBar } from '@/shared/components/TopBar/TopBar.component'
import Stickynav from '@/shared/components/Footer/Stickynav.component'
import Footer from '@/shared/components/Footer/Footer.component'
import { ContentShell } from '@/shared/components/ContentShell.component'

export const metadata: Metadata = {
  title: 'AGB | Allgemeine Geschäftsbedingungen | Planenadler',
  description:
    'Allgemeine Geschäftsbedingungen der Firma Adler Planen – Lieferung, Zahlung, Widerrufsrecht.',
  openGraph: {
    title: 'AGB | Planenadler',
    description: 'Allgemeine Geschäftsbedingungen.',
  },
}

const linkClass = 'underline hover:text-[#1F5CAB]'
const h2Class = 'text-lg font-semibold text-[#1F5CAB] mt-8 first:mt-6'
const h3Class = 'text-base font-semibold text-[#1F5CAB] mt-6'
const addressBlock = 'mt-2 font-normal'

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-white pb-24 sm:pt-20 lg:pb-16">
      <TopBar />
      <article className="py-12" aria-label="Allgemeine Geschäftsbedingungen">
        <ContentShell className="max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F5CAB] sm:text-3xl">
            Allgemeine Geschäftsbedingungen der Firma Adler Planen
          </h1>

          <div className="mt-8 space-y-4 text-[#1F5CAB]/90 text-sm leading-relaxed">
            {/* §1 */}
            <section>
              <h2 className={h2Class}>
                § 1 Geltung gegenüber Unternehmern und Begriffsdefinitionen
              </h2>
              <p>
                (1) Die nachfolgenden Allgemeinen Geschäftsbedingungen gelten für
                alle Lieferungen zwischen uns und einem Verbraucher in ihrer zum
                Zeitpunkt der Bestellung gültigen Fassung.
              </p>
              <p>
                Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu
                Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch
                ihrer selbständigen beruflichen Tätigkeit zugerechnet werden
                können (§ 13 BGB).
              </p>
            </section>

            {/* §2 */}
            <section>
              <h2 className={h2Class}>
                § 2 Zustandekommen eines Vertrages, Speicherung des Vertragstextes
              </h2>
              <p>
                (1) Die folgenden Regelungen über den Vertragsabschluss gelten
                für Bestellungen über unseren Internetshop{' '}
                <a
                  href="https://www.shop.planenadler.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  https://www.shop.planenadler.de
                </a>
                .
              </p>
              <p>
                (2) Im Falle des Vertragsschlusses kommt der Vertrag mit
                Adler Planen, Ahmet Karadag, Düsseldorferstr. 387, D-47055
                Duisburg (Registernummer / Registergericht: siehe Impressum)
                zustande.
              </p>
              <p>
                (3) Die Präsentation der Waren in unserem Internetshop stellen
                kein rechtlich bindendes Vertragsangebot unsererseits dar, sondern
                sind nur eine unverbindliche Aufforderung an den Verbraucher,
                Waren zu bestellen. Mit der Bestellung der gewünschten Ware gibt
                der Verbraucher ein für ihn verbindliches Angebot auf Abschluss
                eines Kaufvertrages ab.
              </p>
              <p>
                (4) Bei Eingang einer Bestellung in unserem Internetshop gelten
                folgende Regelungen: Der Verbraucher gibt ein bindendes
                Vertragsangebot ab, indem er die in unserem Internetshop
                vorgesehene Bestellprozedur erfolgreich durchläuft.
              </p>
              <p>
                <strong>Die Bestellung erfolgt in folgenden Schritten:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Auswahl und Konfiguration der gewünschten Ware</li>
                <li>Bestätigen durch Anklicken der Buttons „Bestellen“</li>
                <li>Prüfung der Angaben im Warenkorb</li>
                <li>Betätigung des Buttons „zur Kasse“</li>
                <li>
                  Ausfüllen der Kontaktdaten im Internetshop und Eingabe der
                  Anmeldedaten (E-Mail-Adresse und Passwort)
                </li>
                <li>Nochmalige Prüfung bzw. Berichtigung der jeweiligen eingegebenen Daten</li>
                <li>
                  Verbindliche Absendung der Bestellung durch Anklicken des
                  Buttons „kostenpflichtig bestellen“ bzw. „kaufen“
                </li>
              </ol>
              <p>
                Der Verbraucher kann vor dem verbindlichen Absenden der Bestellung
                durch Betätigen der in dem von ihm verwendeten Internet-Browser
                enthaltenen „Zurück“-Taste nach Kontrolle seiner Angaben wieder zu
                der Internetseite gelangen, auf der die Angaben des Kunden erfasst
                werden, und Eingabefehler berichtigen bzw. durch Schließen des
                Internetbrowsers den Bestellvorgang abbrechen.
              </p>
              <p>
                Wir bestätigen den Eingang der Bestellung unmittelbar durch eine
                automatisch generierte E-Mail („Auftragsbestätigung“). Mit dieser
                nehmen wir Ihr Angebot an.
              </p>
              <p>
                (5) Speicherung des Vertragstextes bei Bestellungen über unseren
                Internetshop: Wir speichern den Vertragstext und senden Ihnen die
                Bestelldaten und unsere AGB per E-Mail zu. Die AGB können Sie
                jederzeit auch unter{' '}
                <a
                  href="https://shop.planenadler.de/agb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  https://shop.planenadler.de/agb
                </a>{' '}
                einsehen. Ihre vergangenen Bestellungen können Sie in unserem
                Kunden-Bereich unter Mein Konto → Meine Bestellungen einsehen.
              </p>
            </section>

            {/* §3 */}
            <section>
              <h2 className={h2Class}>
                § 3 Preise, Versandkosten, Zahlung, Fälligkeit
              </h2>
              <p>
                (1) Die angegebenen Preise enthalten die gesetzliche
                Umsatzsteuer und sonstige Preisbestandteile. Hinzu kommen
                etwaige Versandkosten.
              </p>
              <p>
                (2) Der Verbraucher hat die Möglichkeit der Zahlung per
                Vorkasse, PayPal, Kreditkarte (Visa, Mastercard, American
                Express).
              </p>
              <p>
                (3) Hat der Verbraucher die Zahlung per Vorkasse gewählt, so
                verpflichtet er sich, den Kaufpreis unverzüglich nach
                Vertragsschluss zu zahlen.
              </p>
            </section>

            {/* §4 */}
            <section>
              <h2 className={h2Class}>§ 4 Lieferung</h2>
              <p>
                (1) Sofern wir dies in der Produktbeschreibung nicht deutlich
                anders angegeben haben, sind alle von uns angebotenen Artikel
                sofort versandfertig. Die Lieferung erfolgt hier spätestens
                innerhalb von 14 Werktagen. Dabei beginnt die Frist für die
                Lieferung im Falle der Zahlung per Vorkasse am Tag nach
                Zahlungsauftrag an die mit der Überweisung beauftragte Bank und
                bei allen anderen Zahlungsarten am Tag nach Vertragsschluss zu
                laufen. Fällt das Fristende auf einen Samstag, Sonntag oder
                gesetzlichen Feiertag am Lieferort, so endet die Frist am nächsten
                Werktag.
              </p>
              <p>
                (2) Die Gefahr des zufälligen Untergangs und der zufälligen
                Verschlechterung der verkauften Sache geht auch beim
                Versendungskauf erst mit der Übergabe der Sache an den Käufer auf
                diesen über.
              </p>
            </section>

            {/* §5 */}
            <section>
              <h2 className={h2Class}>§ 5 Eigentumsvorbehalt</h2>
              <p>
                Wir behalten uns das Eigentum an der Ware bis zur vollständigen
                Bezahlung des Kaufpreises vor.
              </p>
            </section>

            {/* §6 Widerrufsrecht */}
            <section>
              <h2 className={h2Class}>
                § 6 Widerrufsrecht des Kunden als Verbraucher
              </h2>
              <p>
                Verbrauchern steht ein Widerrufsrecht nach folgender Maßgabe zu.
                Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu
                Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch
                ihrer selbständigen beruflichen Tätigkeit zugerechnet werden
                können.
              </p>

              <h3 className={h3Class}>Widerrufsbelehrung</h3>
              <p>
                <strong>Widerrufsrecht:</strong> Sie haben das Recht, binnen
                vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
                widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag,
                an dem Sie oder ein von Ihnen benannter Dritter, der nicht der
                Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
              </p>
              <p>
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
              </p>
              <p className={addressBlock}>
                Adler Planen
                <br />
                Ahmet Karadag
                <br />
                Düsseldorferstr. 387
                <br />
                D-47055 Duisburg
                <br />
                E-Mail:{' '}
                <a href="mailto:post@planenadler.de" className={linkClass}>
                  post@planenadler.de
                </a>
              </p>
              <p>
                mittels einer eindeutigen Erklärung (z. B. ein mit der Post
                versandter Brief, Telefax oder E-Mail) über Ihren Entschluss,
                diesen Vertrag zu widerrufen, informieren. Sie können dafür das
                beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
                vorgeschrieben ist.
              </p>

              <h3 className={h3Class}>Widerrufsfolgen</h3>
              <p>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
                Zahlungen, die wir von Ihnen erhalten haben, einschließlich der
                Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich
                daraus ergeben, dass Sie eine andere Art der Lieferung als die von
                uns angebotene, günstigste Standardlieferung gewählt haben),
                unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
                zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses
                Vertrags bei uns eingegangen ist.
              </p>
              <p>
                Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das
                Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei
                denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in
                keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte
                berechnet.
              </p>
              <p>
                Wir können die Rückzahlung verweigern, bis wir die Waren wieder
                zurückerhalten haben oder bis Sie den Nachweis erbracht haben,
                dass Sie die Waren zurückgesandt haben, je nachdem, welches der
                frühere Zeitpunkt ist.
              </p>
              <p>
                Sie haben die Waren unverzüglich und in jedem Fall spätestens
                binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf
                dieses Vertrages unterrichten, an uns zurückzusenden oder zu
                übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf
                der Frist von vierzehn Tagen absenden. Sie tragen die
                unmittelbaren Kosten der Rücksendung der Waren.
              </p>
              <p className="font-semibold">Ende der Widerrufsbelehrung</p>
            </section>

            {/* §7 Widerrufsformular */}
            <section>
              <h2 className={h2Class}>§ 7 Widerrufsformular</h2>
              <p>
                <strong>Muster-Widerrufsformular</strong>
                <br />
                (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte
                dieses Formular aus und senden Sie es zurück.)
              </p>
              <p className="mt-2">
                An: Adler Planen, Ahmet Karadag, Düsseldorferstr. 387, D-47055
                Duisburg, E-Mail{' '}
                <a href="mailto:post@planenadler.de" className={linkClass}>
                  post@planenadler.de
                </a>
              </p>
              <p className="mt-4">
                Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen
                Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der
                folgenden Dienstleistung (*)
              </p>
              <p className="mt-2 border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">
                Bestellt am (*) / erhalten am (*){' '}
                <span className="border-b border-[#1F5CAB]/30 inline-block min-w-[120px]">
                  {' '}
                </span>
              </p>
              <p className="mt-2">
                Name des/der Verbraucher(s)
              </p>
              <p className="border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">
                Anschrift des/der Verbraucher(s)
              </p>
              <p className="border-b border-[#1F5CAB]/30 pb-1">
                _____________________________________________________
              </p>
              <p className="mt-2">
                Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf
                Papier){' '}
                <span className="border-b border-[#1F5CAB]/30 inline-block min-w-[120px]">
                  {' '}
                </span>
              </p>
              <p className="mt-2">
                Datum{' '}
                <span className="border-b border-[#1F5CAB]/30 inline-block min-w-[120px]">
                  {' '}
                </span>
              </p>
              <p className="mt-4 text-[#1F5CAB]/80">
                (*) Unzutreffendes streichen.
              </p>
            </section>

            {/* §8 */}
            <section>
              <h2 className={h2Class}>§ 8 Gewährleistung</h2>
              <p>Es gelten die gesetzlichen Gewährleistungsregelungen.</p>
            </section>

            {/* §9 */}
            <section>
              <h2 className={h2Class}>§ 9 Vertragssprache</h2>
              <p>
                Als Vertragssprache steht ausschließlich Deutsch zur Verfügung.
              </p>
            </section>

            {/* §10 */}
            <section>
              <h2 className={h2Class}>§ 10 Kundendienst</h2>
              <p>
                Unser Kundendienst für Fragen, Reklamationen und Beanstandungen
                steht Ihnen werktags von 7:00 Uhr bis 17:00 Uhr unter
              </p>
              <p className={addressBlock}>
                Telefon: 0172 7436428
                <br />
                E-Mail:{' '}
                <a href="mailto:post@planenadler.de" className={linkClass}>
                  post@planenadler.de
                </a>
              </p>
              <p>zur Verfügung.</p>
            </section>

            {/* Schluss */}
            <section className="pt-4 border-t border-[#DBE9F9]">
              <p className="text-[#1F5CAB]/70">Stand der AGB: Jul. 2024</p>
              <p className="text-[#1F5CAB]/70 mt-1">
                Gratis AGB erstellt von{' '}
                <a
                  href="https://www.agb.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  agb.de
                </a>
              </p>
              <p className="mt-4">
                <strong>Alternative Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO und § 36 VSBG:</strong>
                <br />
                Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle sind wir nicht verpflichtet und
                nicht bereit.
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
