import type { FaqItem, FaqSection } from '../types'

function createFaqItem(sectionId: string, index: number, question: string, answer: string): FaqItem {
  return {
    id: `${sectionId}-${index + 1}`,
    question,
    answer,
  }
}

function createFaqSection(id: string, title: string, entries: Array<[string, string]>): FaqSection {
  return {
    id,
    title,
    items: entries.map(([question, answer], index) => createFaqItem(id, index, question, answer)),
  }
}

/**
 * Ueberblick fuer shop.planenadler.de – Eintraege nur dort, wo keine inhaltliche
 * Dopplung zu den folgenden Produktthemen (z. B. Versand, Zahlungen, Messanleitungen) besteht.
 */
const PLANENADLER_SHOP_OVERVIEW_SECTIONS: FaqSection[] = [
  createFaqSection('faq-allgemein', 'Allgemein', [
    [
      'Was bietet Planenadler an?',
      'Planenadler bietet massgefertigte PVC-Planen, Abdeckhauben, Anhaengerplanen, Terrassenplanen, Poolabdeckungen, Sichtschutzloesungen und weitere individuelle Planenkonfektionen an. Ueber <a href="/shop">shop.planenadler.de</a> koennen Sie passende Produkte konfigurieren und direkt bestellen.',
    ],
    [
      'Fuer wen sind die Produkte von Planenadler geeignet?',
      'Die Produkte eignen sich fuer Privatkunden, Gewerbekunden, Handwerker, Gartenbesitzer, Anhaengerbesitzer und Unternehmen, die langlebige und passgenaue Planenloesungen benoetigen.',
    ],
    [
      'Gibt es bei Planenadler auch Loesungen fuer gewerbliche Kunden?',
      'Ja. Planenadler bietet auch Loesungen fuer gewerbliche Einsaetze an, zum Beispiel fuer Anhaenger, Container, Terrassen, Lagerbereiche oder Maschinenabdeckungen.',
    ],
    [
      'Kann ich bei Planenadler Massanfertigungen bestellen?',
      'Ja. Viele Produkte koennen Sie im <a href="/shop">Shop</a> individuell nach Mass konfigurieren und bestellen – fuer eine Loesung, die zu Ihrem Einsatzbereich passt.',
    ],
    [
      'Welche Vorteile haben massgefertigte Planen von Planenadler?',
      'Massanfertigungen bieten bessere Passform, mehr Schutz, eine sauberere Optik und meist eine laengere Nutzungsdauer als Standardloesungen von der Stange.',
    ],
    [
      'Welche Materialien verwendet Planenadler?',
      'Planenadler setzt auf robuste, langlebige Materialien wie hochwertiges PVC-Planenmaterial fuer viele Anwendungen im Aussenbereich. Technische Details und Vergleiche (z. B. PVC und PE) finden Sie in den FAQ-Bereichen Abdeckplanen und Material weiter unten.',
    ],
    [
      'Sind die Produkte von Planenadler witterungsbestaendig?',
      'Ja. Die Produkte sind fuer den Einsatz im Aussenbereich konzipiert und schuetzen zuverlaessig vor Regen, Schmutz, Wind und vielen weiteren Umwelteinfluessen.',
    ],
    [
      'Kann ich bei shop.planenadler.de auch Sonderloesungen anfragen?',
      'Ja. Bei besonderen Formen oder Anforderungen unterstuetzt Sie Planenadler – nutzen Sie den Konfigurator oder die <a href="/kontakt">Kontaktseite</a> fuer eine individuelle Abstimmung.',
    ],
    [
      'Warum sollte ich bei Planenadler bestellen?',
      'Planenadler steht fuer individuelle Planenloesungen, moderne Online-Konfiguration, passgenaue Fertigung und eine grosse Auswahl an Produkten fuer Schutz, Abdeckung und Verkleidung.',
    ],
    [
      'Kann ich meine Bestellung bei Planenadler mit Skizze oder Foto ergaenzen?',
      'Ja. Bei komplexeren Anforderungen helfen Skizze oder Foto, Ihre gewuenschte Ausfuehrung klar zu machen – Sie koennen sie im Bestellprozess bzw. ueber den Kontakt einreichen.',
    ],
  ]),
  createFaqSection('faq-planen-allgemein', 'Planen', [
    [
      'Wofuer kann ich eine Plane von Planenadler verwenden?',
      'Eine Plane kann zum Schutz von Moebeln, Anhaengern, Holz, Maschinen, Fahrzeugen, Terrassenbereichen, Pools und vielen weiteren Gegenstaenden eingesetzt werden.',
    ],
    [
      'Was ist der Unterschied zwischen einer Plane und einer Haube?',
      'Eine Plane ist in der Regel eine flache oder angepasste Abdeckung; eine Haube umschliesst den Gegenstand meist staerker von oben und an den Seiten. Beides finden Sie passend zu Ihrem Bedarf im Sortiment.',
    ],
    [
      'Sind Planen von Planenadler wasserdicht?',
      'Hochwertige PVC-Planen sind fuer zuverlaessigen Wetterschutz ausgelegt und eignen sich sehr gut als widerstandsfaehige Abdeckung im Aussenbereich. Details zu Materialien finden Sie auch unter dem Thema Material weiter unten.',
    ],
    [
      'Kann ich eine Plane bei shop.planenadler.de in Wunschmassen bestellen?',
      'Ja. Viele Planen koennen Sie im <a href="/shop">Shop</a> mit Ihren Massen und Optionen konfigurieren.',
    ],
    [
      'Welche Formen sind bei Planenadler moeglich?',
      'Je nach Produkt sind rechteckige, runde, ovale oder weitere individuelle Formen moeglich, damit die Plane optimal zum Einsatzbereich passt.',
    ],
    [
      'Was bedeutet Randverstaerkung bei einer Plane?',
      'Eine Randverstaerkung erhoeht die Stabilitaet an den Aussenkanten – sinnvoll bei staerkerer Belastung oder haeufiger Befestigung.',
    ],
    [
      'Wozu dienen Oesen in einer Plane?',
      'Oesen erleichtern die sichere Befestigung der Plane, etwa mit Expanderseilen oder Spanngurten. Je nach Produkt waehlen Sie passende Oesenabstaende und -groessen.',
    ],
    [
      'Welche Oesenvarianten gibt es bei Planenadler?',
      'Je nach Produkt sind verschiedene Befestigungsoptionen moeglich, zum Beispiel Rundoesen in ueblichen Durchmessern; Details stehen im jeweiligen Konfigurator.',
    ],
    [
      'Wie reinige ich eine Plane von Planenadler?',
      'In der Regel mit Wasser, einem weichen Tuch und mildem Reinigungsmittel. Aggressive Reiniger, Scheuermittel und Hochdruckreiniger sollten vermieden werden. Produkt-spezifische Hinweise finden Sie bei Abdeckplanen und Terrassenplanen weiter unten.',
    ],
    [
      'Wie lange haelt eine Plane von Planenadler?',
      'Die Lebensdauer haengt von Nutzung, Witterung und Pflege ab. Hochwertiges PVC und passende Konfiguration sind auf Langlebigkeit ausgelegt – bei sachgemaesser Pflege koennen PVC-Planen viele Jahre halten.',
    ],
  ]),
  createFaqSection('faq-hauben-allgemein', 'Hauben und Abdeckhauben', [
    [
      'Was ist eine Abdeckhaube von Planenadler?',
      'Eine Abdeckhaube ist eine passgenaue Schutzloesung, die Gegenstaende von oben und an den Seiten abdeckt und vor Witterung, Staub und Schmutz schuetzt.',
    ],
    [
      'Fuer welche Gegenstaende eignen sich Hauben von Planenadler?',
      'Unter anderem fuer Gartenmoebel, Grills, Maschinen, Geraete, Container, Tische oder individuelle Sonderformen – jeweils nach Mass konfigurierbar, z. B. als <a href="/product/abdeckhaube">Abdeckhaube</a>.',
    ],
    [
      'Sollte eine Haube exakt passen oder etwas groesser sein?',
      'Die Haube sollte weder zu eng noch unnoetig gross sein. Eine moderate Zugabe an Masse kann sinnvoll sein, damit sich die Haube leichter aufziehen laesst; genaue Hinweise finden Sie bei der jeweiligen Messanleitung.',
    ],
    [
      'Kann ich bei Planenadler auch Grillhauben bestellen?',
      'Ja. Haubenloesungen fuer Grills und andere Garten- oder Freizeitobjekte sind ueber Massanfertigungen im Shop bzw. auf Anfrage moeglich.',
    ],
    [
      'Kann ich eine Haube mit Befestigung bestellen?',
      'Je nach Produkt und Ausfuehrung gibt es passende Befestigungsoptionen wie Oesen, Gummizuege oder Spannteile – waehlbar im Konfigurator, soweit angeboten.',
    ],
  ]),
  createFaqSection('faq-anhaenger-allgemein', 'Anhaengerplanen', [
    [
      'Bietet Planenadler Anhaengerplanen nach Mass an?',
      'Ja. Anhaengerplanen werden nach Mass gefertigt, damit sie optimal zu Ihrem Anhaenger passen – z. B. als <a href="/product/hochplane">Hochplane</a> oder <a href="/product/anhaenger-flachplane">Flachplane</a>.',
    ],
    [
      'Welche Anhaengerplanen gibt es bei Planenadler?',
      'Je nach Bedarf unter anderem Flachplanen, Hochplanen (mit Spriegel) und weitere individuelle Ausfuehrungen – im Ueberblick im <a href="/shop?category=anhaengerplanen">Shop-Bereich Anhaengerplanen</a>.',
    ],
    [
      'Warum ist eine passgenaue Anhaengerplane wichtig?',
      'Sie sorgt fuer besseren Schutz der Ladung, sichere Befestigung und eine saubere Optik am Fahrzeug.',
    ],
    [
      'Kann ich fuer meinen Hochlader oder Sonderanhaenger eine Plane bestellen?',
      'Ja. Planenadler ist auf individuelle Loesungen spezialisiert; bei Sondermassen und -typen helfen Praezisionsmessung und ggf. eine Skizze.',
    ],
    [
      'Wie messe ich meine Anhaengerplane richtig aus?',
      'Ermitteln Sie die Aussenmasse des Anhaengers bzw. des Gestells sorgfaeltig. Im Konfigurator finden Sie die benoetigten Felder; bei Sonderformen ist eine Skizze hilfreich.',
    ],
    [
      'Schuetzt eine Anhaengerplane von Planenadler auch waehrend des Transports?',
      'Ja. Korrekt konfiguriert und befestigt schuetzt die Plane die Ladung waehrend Transport und Standzeit.',
    ],
  ]),
  createFaqSection('faq-terrasse-sichtschutz', 'Terrassenplanen und Sichtschutz', [
    [
      'Wofuer eignet sich eine Terrassenplane von Planenadler?',
      'Als Windschutz, Wetterschutz und seitliche Abgrenzung fuer Terrassen, Ueberdachungen oder Aussenbereiche – konfigurierbar als <a href="/product/terrassenplanen">Terrassenplanen</a>.',
    ],
    [
      'Sind Terrassenplanen von Planenadler auch als Sichtschutz geeignet?',
      'Ja. Viele Loesungen dienen zugleich dem Wetterschutz und mehr Privatsphaere im Aussenbereich.',
    ],
    [
      'Fuer welche Bereiche eignet sich ein Sichtschutz von Planenadler?',
      'Zum Beispiel fuer Balkon, Terrasse, Garten, Zaun oder gewerbliche Aussenbereiche – je nach Produkt und Massanfertigung.',
    ],
  ]),
  createFaqSection('faq-pool-allgemein', 'Poolabdeckungen', [
    [
      'Welche Vorteile bietet eine Poolabdeckung von Planenadler?',
      'Sie schuetzt den Pool vor Laub, Schmutz und anderen aeusseren Einfluessen und erleichtert die Pflege.',
    ],
    [
      'Ist eine Poolabdeckung von Planenadler fuer verschiedene Poolformen geeignet?',
      'Ja. Es gibt Loesungen fuer unterschiedliche Poolformen und individuelle Masse – siehe <a href="/product/poolplane">Poolplane</a> im Konfigurator.',
    ],
  ]),
  createFaqSection('faq-bestellung-shop', 'Bestellung, Versand und Zahlung', [
    [
      'Wie bestelle ich bei shop.planenadler.de?',
      'Waehlen Sie Ihr Produkt, konfigurieren Sie es im Konfigurator und schliessen Sie die Bestellung im Checkout ab.',
    ],
    [
      'Kann ich bei Planenadler mehrere Produkte gleichzeitig bestellen?',
      'Ja. Sie koennen mehrere Artikel in den Warenkorb legen und in einer Bestellung zusammenfassen.',
    ],
    [
      'Welche Zahlungsmoeglichkeiten gibt es bei shop.planenadler.de?',
      'Die aktuell verfuegbaren Zahlungsarten sehen Sie im Checkout. Ausfuehrliche Informationen finden Sie zusaetzlich im FAQ-Bereich Zahlungen weiter unten auf dieser Seite.',
    ],
    [
      'Wie laeuft der Versand bei Planenadler ab?',
      'Bestellungen werden sicher verpackt versendet – je nach Groesse per Paketdienst oder Spedition. Details zu Versandarten und Kosten finden Sie im FAQ-Bereich Versand weiter unten sowie auf der <a href="/versand">Versandseite</a>.',
    ],
    [
      'Wie lange dauert die Lieferung bei Planenadler?',
      'Lieferzeit und Produktion haengen vom Produkt und vom Grad der Individualisierung ab. Richtwerte und Ablauf beschreiben der Bestellprozess, der FAQ-Bereich Versand und der Abschnitt Wie wir arbeiten weiter unten auf dieser Seite.',
    ],
    [
      'Wie kann ich Planenadler kontaktieren?',
      'Ueber die <a href="/kontakt">Kontaktseite</a> sowie die auf der Webseite angegebenen Kanaele, wenn Sie Fragen zu Produkten, Massen oder Sonderanfertigungen haben.',
    ],
  ]),
]

export const ABOUT_FAQ_SECTIONS: FaqSection[] = [
  ...PLANENADLER_SHOP_OVERVIEW_SECTIONS,
  createFaqSection('terrassenplanen', 'Terrassenplanen', [
    ['Wie messe ich eine Terrassenoeffnung korrekt aus?', 'Messen Sie Breite und Hoehe von Pfostenaussenseite zu Pfostenaussenseite und beruecksichtigen Sie alle Seiten, an denen die Plane anliegen soll. Bei Massanfertigungen sollte genuegend Platz, mindestens 10 cm, fuer Oesen und Fenster eingeplant werden. Passend dazu finden Sie unsere <a href="/product/terrassenplanen">Terrassenplanen</a> direkt im Konfigurator.'],
    ['Woran erkenne ich die Aussen- und Innenseite einer Terrassenplane?', 'Die Aussenseite ist glatt und glaenzend, waehrend die Innenseite leicht rau und matt ist.'],
    ['Wie reinige ich meine Terrassenplane?', 'Verwenden Sie lauwarmes Wasser und ein mildes Spuelmittel. Aggressive Chemikalien oder Hochdruckreiniger sind zu vermeiden. Nach der Reinigung gruendlich abspuelen und vollstaendig trocknen lassen.'],
    ['Wofuer ist ein in den Saum eingearbeitetes Randseil gut?', 'Ein Randseil verstaerkt die Kanten des Sonnensegels oder der Plane und verteilt die Zugkraft gleichmaessig, wodurch die Oesen geschont und die Spannung verbessert werden.'],
    ['Wie wird eine Terrassenplane befestigt?', 'Die Plane wird meist mit Gummiseilen und Drehverschluessen befestigt. Arbeiten Sie von der linken Seite aus, markieren Sie die Befestigungspunkte und montieren Sie die Haken nacheinander. Ein Helfer erleichtert die Montage erheblich.'],
    ['Wie gross sollen die Oesenabstaende bei Terrassenplanen sein?', 'Standardmaessig werden die Oesen 2 bis 3 cm vom Rand entfernt gesetzt. Der Innendurchmesser von Rundoesen betraegt meist 16 mm, es gibt aber auch 10 mm, 12 mm, 20 mm oder 25 mm.'],
    ['Welche Materialien und Farben gibt es fuer Terrassenplanen?', 'Terrassenplanen bestehen meist aus robuster PVC-LKW-Plane, die wetterfest und UV-bestaendig ist. Alle Farben sind gleich haltbar, jedoch koennen kraeftige Farben wie Orange, Rot und Blau schneller ausbleichen.'],
    ['Wie pflege ich die Plane im Winter?', 'Reinigen Sie die Plane wie oben beschrieben, lassen Sie sie vollstaendig trocknen und lagern Sie sie kuehl, trocken und belueftet. Falten oder rollen Sie sie ordentlich und schuetzen Sie sie vor scharfen Gegenstaenden.'],
    ['Kann man Tueren oder Fenster in Terrassenplanen integrieren?', 'Ja. Bei Massanfertigungen koennen Reissverschluesse als Tuer oder Fenster eingearbeitet werden. Die Oeffnungen sollten mit ausreichend Abstand, mindestens 10 cm, zu den Raendern geplant werden, damit Oesen und Verstaerkungen nicht stoeren.'],
    ['Wie bestelle ich eine massgefertigte Terrassenplane?', 'Vermessen Sie die Oeffnungen wie beschrieben, waehlen Sie Material und Farbe und kontaktieren Sie Planenadler. Viele Sonderwuensche koennen direkt ueber den <a href="/shop">Konfigurator im Shop</a> oder ueber die <a href="/kontakt">Kontaktseite</a> abgestimmt werden.'],
  ]),
  createFaqSection('poolabdeckungen', 'Poolabdeckungen', [
    ['Wie montiere ich eine Poolabdeckung richtig?', 'Poolabdeckungen werden mithilfe von Aluminiumstangen und Spannern montiert. Im Lieferumfang sind haeufig alle benoetigten Werkzeuge enthalten, und eine Montageanleitung zeigt die Schritte im Detail.'],
    ['Wie schuetzt eine Poolplane meinen Pool vor Schmutz?', 'Abdeckungen aus LKW-Planen schuetzen zuverlaessig vor Laub, Insekten und Schmutz. Netze im Hohlsaum lassen Regenwasser ablaufen, waehrend groebere Verschmutzungen abgehalten werden.'],
    ['Gibt es Standardgroessen fuer Poolabdeckungen?', 'Ja. Viele Hersteller bieten Groessen fuer gaengige Poolmarken an. Massgeschneiderte Loesungen sind ebenfalls moeglich, wenn Masse und Form des Beckens angegeben werden.'],
    ['Wie messe ich einen Pool fuer eine Abdeckung?', 'Messen Sie die Innenlaenge und Innenbreite des Beckens und addieren Sie rund 3 cm, damit die Abdeckung leicht aufgelegt werden kann.'],
    ['Warum sind Netze in die Hohlsaeume einiger Poolabdeckungen integriert?', 'Die Netze sorgen dafuer, dass Regenwasser ablaufen kann, ohne dass die Abdeckung durchhaengt, und verhindern gleichzeitig, dass Blaetter oder groessere Partikel in den Pool gelangen.'],
    ['Welches Material wird fuer Poolabdeckungen verwendet?', 'Fuer hochwertige Abdeckungen wird beschichtetes PVC verwendet, das wasserdicht, UV- und frostbestaendig ist. Grammaturen zwischen 650 g/m2 und 680 g/m2 bieten hohe Reissfestigkeit.'],
    ['Wie reinigt man eine Poolabdeckung?', 'Wie bei anderen Planen mit lauwarmem Wasser und mildem Reinigungsmittel. Hochdruckreiniger und loesungsmittelhaltige Produkte sind zu vermeiden.'],
    ['Wie wird eine Poolplane befestigt?', 'Befestigungssysteme variieren: Gummiseile, Spannstangen oder Kurbelmechanismen halten die Abdeckung straff. Viele Modelle haben Oesen und Spannvorrichtungen im Lieferumfang.'],
    ['Kann ich die Abdeckung zusammenrollen und transportieren?', 'Ja. Hochwertige Abdeckungen lassen sich nach dem Trocknen platzsparend zusammenrollen. Das robuste Material macht haeufige Nutzung und Transport moeglich.'],
    ['Wie bestelle ich eine Poolabdeckung nach Mass?', 'Geben Sie die exakten Innenmasse an und entscheiden Sie sich fuer Material, Farbe und eventuelle Extras wie Drainagenetze. Fuer die Umsetzung koennen Sie direkt unsere <a href="/product/poolplane">Poolplane</a> konfigurieren oder alle Produkte im <a href="/shop">Shop</a> vergleichen.'],
  ]),
  createFaqSection('abdeckplanen', 'Abdeckplanen', [
    ['Welche Materialien stehen bei Abdeckplanen zur Auswahl?', 'PVC-Planen bestehen aus Polyestergewebe mit dicker PVC-Beschichtung. Sie sind extrem reissfest, wasserdicht, UV- und schimmelbestaendig und halten haeufig ueber zehn Jahre. PE-Planen haben ein Netz aus Polyethylen, sind leichter und eignen sich fuer kuerzere Einsaetze.'],
    ['Wann sollte ich eine PVC-Plane waehlen?', 'Fuer stark beanspruchte Anwendungen, etwa als Terrassen- oder Poolabdeckung oder fuer Anhaengerplanen, ist PVC die bessere Wahl. Es bietet hohe Reissfestigkeit und ist witterungsbestaendiger.'],
    ['Wann reicht eine PE-Plane aus?', 'PE-Planen eignen sich fuer leichtere oder kurzfristige Abdeckungen wie einfache Gartenarbeiten oder provisorische Schutzhuellen. Sie sind preiswerter, aber weniger langlebig und UV-bestaendig.'],
    ['Wie pflege ich eine PVC-Plane?', 'Saeubern Sie sie regelmaessig mit mildem Reinigungsmittel und Wasser. Vermeiden Sie aggressive Chemikalien. Kleine Risse koennen mit PVC-Kleber repariert werden.'],
    ['Wie befestige ich eine Abdeckplane?', 'Die Planen sind mit Edelstahloesen ausgestattet, durch die Expanderseile oder Spanngurte gefuehrt werden. Fuer Anhaenger wird oft ein umlaufendes Gummiseil verwendet.'],
    ['Gibt es spezielle Planen fuer Holzstapel?', 'Ja. Robuste PVC-Abdeckplanen schuetzen Holzstapel zuverlaessig vor Regen und Witterung.'],
    ['Sind alle Planen UV-bestaendig?', 'Hochwertige PVC-Planen reduzieren die UV-Strahlung sehr stark. PE-Planen bieten deutlich weniger UV-Schutz und altern schneller.'],
    ['Wie bestellt man Planen nach Mass?', 'Sie koennen die gewuenschten Masse, Farbe und Oesenabstaende angeben. Planenadler fertigt daraufhin eine passgenaue Plane an. Fuer klassische Abdeckungen finden Sie passende Optionen bei der <a href="/product/abdeckplane">Abdeckplane</a>.'],
    ['Wie lange halten Abdeckplanen?', 'PVC-Planen koennen bei sachgemaesser Pflege ueber ein Jahrzehnt eingesetzt werden.'],
    ['Beeinflusst die Farbe die Haltbarkeit?', 'Alle Farben haben grundsaetzlich dieselbe Lebensdauer. Intensive Farben koennen jedoch schneller ausbleichen.'],
  ]),
  createFaqSection('abdeckhauben', 'Abdeckhauben', [
    ['Wie messe ich eine Abdeckhaube fuer Gartenmoebel oder einen Grill?', 'Messen Sie die aeusseren Abmessungen des Moebelstuecks und addieren Sie etwa 3 cm zu Laenge und Breite, damit die Haube leicht uebergezogen werden kann.'],
    ['Wie bestimme ich die Groesse einer Haube?', 'Zur gemessenen Laenge und Breite schlagen Sie etwas Spielraum hinzu. Bei hohen Gegenstaenden sollten Sie auch die Hoehe beruecksichtigen. Hier kann ebenfalls etwas Mehrmass sinnvoll sein.'],
    ['Wie bewahre ich Hauben richtig auf?', 'Nach der Reinigung trocknen lassen und dann an einem kuehlen, trockenen Ort lagern. Hauben sollten gefaltet oder gerollt und vor Sonneneinstrahlung geschuetzt aufbewahrt werden.'],
    ['Wie reinige ich Hauben?', 'Nutzen Sie lauwarmes Wasser, mildes Spuelmittel und eine weiche Buerste. Anschliessend gruendlich abspuelen und vollstaendig trocknen.'],
    ['Wie montiere ich eine Haube?', 'Die Haube wird ueber das Objekt gezogen. Gummizuege oder Spannseile fixieren sie. Bei Hauben mit Reissverschluss oder Oesen erleichtert dies das Anbringen.'],
    ['Welches Material wird verwendet?', 'Planenadler verwendet hochwertige PVC-Gewebe fuehrender Hersteller. Die Produkte sind wetter-, wasser-, frost- und schmutzbestaendig.'],
    ['Sind Hauben wiederverwendbar und witterungsbestaendig?', 'Ja. Aufgrund des robusten Materials sind sie ueber Jahre hinweg einsetzbar und bieten Schutz vor Regen, Frost, Sonne und Schmutz.'],
    ['Welche Verschluesse gibt es?', 'Je nach Ausfuehrung sind Drehverschluesse, Reissverschluesse, Gummiseile oder Klettverschluesse erhaeltlich. Fuer ovale Oesen werden spezielle Drehverschluesse genutzt.'],
    ['Kann die Haube mit Fenstern oder Reissverschluessen ausgestattet werden?', 'Ja. Bei Massanfertigungen koennen transparente Folienfenster oder Reissverschluesse integriert werden.'],
    ['Wie bestelle ich eine Haube nach Mass?', 'Messen Sie das Objekt wie beschrieben, waehlen Sie Material, Farbe und eventuelle Extras und kontaktieren Sie Planenadler fuer ein Angebot. Die passende Produktseite finden Sie unter <a href="/product/abdeckhaube">Abdeckhaube</a>.'],
  ]),
  createFaqSection('gitterboxen', 'Gitterboxen', [
    ['Welche Materialien stehen fuer Gitterboxenhauben zur Verfuegung?', 'Es gibt PVC-Strong-Line-Gewebe und die leichtere Grid-Line-Folie. Beide Varianten sind wasserdicht, UV-bestaendig und schmutzabweisend.'],
    ['Welche Hoehen werden angeboten?', 'Hauben gibt es unter anderem in 45 cm fuer flache Ladungen, 80 cm fuer mittlere Beladung und 125 cm fuer hohe oder komplett gefuellte Gitterboxen.'],
    ['Sind die Hauben wasserdicht und UV-bestaendig?', 'Ja. Die robusten PVC-Gewebe schuetzen vor Feuchtigkeit, Sonnenlicht und Schmutz.'],
    ['Gibt es Reissverschluesse und Oesen?', 'Viele Modelle sind mit Reissverschluss und 12-mm-Oesen ausgestattet, die im Abstand von 50 cm gesetzt werden, um die Haube festzubinden.'],
    ['Wie befestige ich eine Gitterboxenhaube?', 'Durch die Oesen koennen Spanngurte oder Gummiseile gezogen werden, mit denen die Haube an der Box befestigt wird.'],
    ['Wie reinige ich diese Hauben?', 'Wie bei anderen PVC-Produkten mit mildem Reinigungsmittel und Wasser reinigen und anschliessend gut trocknen.'],
    ['Wie waehle ich die richtige Groesse?', 'Messen Sie Laenge, Breite und Hoehe Ihrer Gitterbox. Standardgroessen passen auf die ueblichen 125 x 85 cm Boxen. Sondergroessen werden nach Mass gefertigt.'],
    ['Fuer welche Anwendungen eignen sich die Hauben?', 'Sie schuetzen Waren bei Lagerung und Transport in Industrie, Baustellen und Lagern vor Naesse, Staub und UV-Licht.'],
    ['Welche optionalen Ausstattungen gibt es?', 'Neben dem Reissverschluss koennen Zipper, Belueftungsoeffnungen oder transparente Sichtfenster eingebaut werden.'],
    ['Wie bestelle ich eine Gitterboxenhaube nach Mass?', 'Uebermitteln Sie die gewuenschten Abmessungen und waehlen Sie das passende Material. Die Haube wird individuell gefertigt. Unsere passende Loesung finden Sie unter <a href="/product/gitterbox">Gitterbox</a>.'],
  ]),
  createFaqSection('abdeckhaube-lounge', 'Abdeckhaube Lounge', [
    ['Welche Materialien werden fuer Lounge-Abdeckungen verwendet?', 'Hochwertige PVC-Gewebe mit 620 g/m2 oder 680 g/m2 schuetzen Lounge-Moebel vor Regen, Schmutz und UV-Strahlung. Die hohe Grammatur macht sie reissfest und langlebig.'],
    ['Bieten diese Hauben Schutz vor Sonne und Schmutz?', 'Ja. Die wasserdichte Plane mit starker Beschichtung verhindert, dass Feuchtigkeit eindringt, und die geschlossene Oberflaeche haelt Laub und Staub fern.'],
    ['In welchen Farben sind Lounge-Abdeckungen erhaeltlich?', 'Es stehen zwei Kollektionen mit je 13 Farben zur Verfuegung, sodass Sie zwischen 26 Farbvarianten waehlen koennen.'],
    ['Wie pflege ich meine Lounge-Abdeckung?', 'Reinigen Sie sie wie andere Planen mit Wasser und mildem Reinigungsmittel, lassen Sie sie vollstaendig trocknen und bewahren Sie sie trocken auf.'],
    ['Wie berechne ich die Groesse der Lounge-Abdeckung?', 'Messen Sie die Aussenmasse des Moebelstuecks und geben Sie bei Bedarf ein paar Zentimeter Spielraum, damit die Haube leicht auf- und abgezogen werden kann.'],
    ['Sind die Ecken genaeht oder verschweisst?', 'Je nach Ausfuehrung sind die Ecken genaeht oder verschweisst, wobei beide Varianten stabil und haltbar sind.'],
    ['Wie gross ist der Saum?', 'Die Haube verfuegt ueber einen mindestens 5 cm breiten Saum. Die Oesen werden im Abstand von 2 bis 3 cm in den Saum gesetzt.'],
    ['Wie befestigt man die Abdeckung?', 'Durch die optionalen Oesen koennen Spanngurte oder Gummiseile gefuehrt werden. Alternativ gibt es Modelle mit Kordelzug oder Reissverschluss.'],
    ['Wie lange haelt eine Lounge-Abdeckung?', 'Bei sachgemaesser Pflege koennen diese robusten PVC-Hauben ueber viele Jahre genutzt werden.'],
    ['Kann ich spezielle Farben oder Masse bestellen?', 'Ja. Auf Anfrage koennen auch Sonderfarben oder massgeschneiderte Formen gefertigt werden. Fuer dieses Produkt gelangen Sie direkt zur <a href="/product/abdeckhaube-lounge">Abdeckhaube Lounge</a>.'],
  ]),
  createFaqSection('anhaengerplane-hochplane', 'Anhaengerplane Hochplane', [
    ['Was unterscheidet eine Hochplane von einer Flachplane?', 'Eine Hochplane hat ein Gestell, auch Spriegel genannt, und verleiht dem Anhaenger eine hoehere Ladehoehe. Eine Flachplane wird direkt am Anhaengerrahmen befestigt.'],
    ['Wie montiert man eine Hochplane?', 'Entfernen Sie zuerst die Kunststoffkappen von den Eckpfosten. Setzen Sie die Stuetzpfosten ein und sichern Sie sie, legen Sie das Spriegeloberteil und die Quertraeger auf, rollen Sie die Plane aus und befestigen Sie sie mit Gummiseilen und Clips.'],
    ['Welches Zubehoer wird benoetigt?', 'Sie brauchen Stuetzpfosten, Spriegeloberteil, Quertraeger, Gummiseil, Oesen, Clips und eventuell Werkzeug wie Wasserpumpenzange und Schere.'],
    ['Wie messe ich eine Hochplane?', 'Messen Sie die Laenge, Breite und Hoehe des Anhaengers sowie die Hoehe des Spriegelgestells. Hersteller bieten oft spezifische Groessen fuer gaengige Anhaengermodelle.'],
    ['Aus welchem Material bestehen Hochplanen?', 'Hochplanen werden aus schwerem PVC, haeufig 650 bis 680 g/m2, gefertigt. Das Material ist wasserdicht, UV-bestaendig und reissfest.'],
    ['Wie reinige ich die Plane?', 'Mit lauwarmem Wasser und mildem Reinigungsmittel reinigen und anschliessend trocken lagern.'],
    ['Wie repariere ich kleine Schaeden?', 'Kleine Risse koennen mit einem PVC-Patch und Spezialkleber repariert werden.'],
    ['Welche Farben kann ich waehlen?', 'Die Farbauswahl entspricht meist der Standardfarbpalette des Herstellers. Sonderfarben sind auf Anfrage moeglich.'],
    ['Wie lange dauert die Produktion und Lieferung?', 'Die Herstellung einer Massplane dauert in der Regel zwischen 14 und 21 Tagen. In der Hochsaison kann es laenger dauern.'],
    ['Kann ich eine Hochplane fuer ein bestimmtes Anhaengermodell bestellen?', 'Ja. Viele Hersteller bieten massgeschneiderte Planen fuer spezielle Anhaengertypen an. Geben Sie hierzu die Modellbezeichnung und die gewuenschten Masse an. Die passende Seite bei Planenadler ist <a href="/product/hochplane">Hochplane</a>.'],
  ]),
  createFaqSection('anhaengerplane-flachplane', 'Anhaengerplane Flachplane', [
    ['Wie montiere ich eine Flachplane auf dem Anhaenger?', 'Breiten Sie die Plane aus, spannen Sie sie zuerst an den hinteren Ecken und danach an den vorderen. Schneiden und montieren Sie anschliessend das Gummiseil, faedeln Sie es durch die Oesen und fixieren Sie es mit Klemmen.'],
    ['Welche Materialien und Zubehoerteile brauche ich?', 'Fuer die Montage benoetigen Sie die Plane, ein Gummiseil, Verschluesse oder Klemmen und eventuell eine Schere und Zange.'],
    ['Wie pflege ich die Flachplane?', 'Reinigen und trocknen Sie sie regelmaessig. Kleine Risse lassen sich mit PVC-Kleber reparieren.'],
    ['Wie waehle ich die richtige Groesse der Flachplane?', 'Messen Sie den Anhaengerrahmen und waehlen Sie eine Plane, die etwas uebersteht, damit sie mit dem Gummiseil straff gespannt werden kann.'],
    ['Gibt es spezielle Befestigungen?', 'Ja. Gummiseile oder Expanderseile werden durch die Oesen gefuehrt und sorgen fuer gleichmaessige Spannung.'],
    ['Wie repariere ich kleine Risse?', 'Mit PVC-Patches und Kleber. Das Material laesst sich gut verkleben.'],
    ['Wie wird die Flachplane geliefert?', 'Die Plane wird gerollt geliefert. Das Gummiseil und die Klemmen sind meist separat beigelegt.'],
    ['Wie sichere ich die Plane unterwegs?', 'Kontrollieren Sie, dass das Gummiseil gleichmaessig gespannt ist und alle Oesen besetzt sind. Zusaetzliche Spanngurte koennen fuer mehr Sicherheit sorgen.'],
    ['Wie lange haelt eine Flachplane?', 'Bei sachgemaesser Nutzung halten Flachplanen aus PVC viele Jahre.'],
    ['Kann ich Farbe und Masse anpassen?', 'Ja. Bei Massanfertigungen koennen Sie Farbe, Oesenabstaende und Masse frei waehlen. Direkt konfigurieren koennen Sie das ueber <a href="/product/anhaenger-flachplane">Anhaenger Flachplane</a>.'],
  ]),
  createFaqSection('zahlungen', 'Zahlungen', [
    ['Welche Zahlungsarten bietet Planenadler an?', 'Sie koennen per <a href="https://www.paypal.com/de/home" target="_blank" rel="noopener noreferrer">PayPal</a>, Bankueberweisung, Vorkasse, Nachnahme oder <a href="https://www.klarna.com/de/" target="_blank" rel="noopener noreferrer">Klarna</a> bezahlen.'],
    ['Kann ich per Kreditkarte zahlen?', 'Kreditkartenzahlungen sind indirekt ueber PayPal oder Klarna moeglich. Eine direkte Kreditkartenzahlung wird nicht angeboten.'],
    ['Ist eine Zahlung auf Rechnung moeglich?', 'Ja. Planenadler bietet den Kauf auf Rechnung an. Hierbei wird die Ware nach Bestellung geliefert, und Sie begleichen den Betrag innerhalb der angegebenen Frist.'],
    ['Welche Zahlungsmethode ist am schnellsten?', 'PayPal und Klarna werden sofort verbucht, sodass die Produktion schneller starten kann. Ueberweisungen dauern in der Regel ein bis drei Bankarbeitstage.'],
    ['Gibt es zusaetzliche Gebuehren?', 'Fuer die gaengigen Zahlungsmethoden werden keine zusaetzlichen Gebuehren berechnet. Bei Nachnahme fallen ueblicherweise Gebuehren des Versanddienstleisters an.'],
    ['Wie sicher sind meine Zahlungsdaten?', 'Zahlungen ueber PayPal oder Klarna laufen ueber gesicherte Plattformen. Bei Ueberweisung werden nur die Bankdaten verwendet, die Sie selbst eingeben.'],
    ['Kann ich bar bei Lieferung bezahlen?', 'Barzahlung ist ueber Nachnahme moeglich, sofern dies in Ihrem Land angeboten wird.'],
    ['Was passiert bei Rueckerstattungen?', 'Rueckerstattungen werden ueber die urspruenglich genutzte Zahlungsmethode abgewickelt. Versandkosten werden beim Widerruf nicht erstattet.'],
    ['Erhalte ich eine Rechnung mit ausgewiesener Mehrwertsteuer?', 'Ja. Sie erhalten eine steuerlich korrekte Rechnung mit ausgewiesener Mehrwertsteuer per E-Mail oder in Papierform.'],
    ['Kann ich meine Zahlungsart nach der Bestellung aendern?', 'Das ist nur vor Produktionsbeginn moeglich. Kontaktieren Sie hierfuer zeitnah den Kundenservice.'],
  ]),
  createFaqSection('versand', 'Versand', [
    ['Welche Versandarten gibt es?', 'Sendungen bis 30 kg werden per Paketdienst verschickt. Groessere oder lange Waren werden per Spedition geliefert.'],
    ['Wie hoch sind die Versandkosten?', 'In Deutschland kostet der Paketversand bis 30 kg 9,80 Euro. Sperrige Sendungen per Spedition kosten etwa 120 Euro. Weitere Details finden Sie auf unserer <a href="/versand">Versandseite</a>.'],
    ['Wie lange dauert die Lieferung?', 'Die regulaere Lieferzeit betraegt 7 bis 21 Tage nach Zahlungseingang. Bei komplexen Bestellungen oder in der Saison kann es laenger dauern.'],
    ['Liefern Sie auch ins Ausland?', 'Ja, Lieferungen innerhalb Europas sind moeglich. Die Versandkosten werden individuell kalkuliert. Bestellungen ausserhalb des Onlineshops sollten direkt beim Kundenservice angefragt werden.'],
    ['Wie wird die Ware verpackt?', 'Die Planen werden sorgfaeltig in Folie und Karton verpackt, um sie waehrend des Transports zu schuetzen.'],
    ['Gibt es Expressversand?', 'Ein Expressversand wird nicht standardmaessig angeboten. In dringenden Faellen sollten Sie die Liefermoeglichkeiten direkt anfragen.'],
    ['Kann ich meine Bestellung nachverfolgen?', 'Bei Paketversand erhalten Sie ueblicherweise eine Trackingnummer. Bei Speditionsversand informiert die Spedition ueber den Liefertermin.'],
    ['Kann ich die Ware selbst abholen?', 'Nein. Planenadler bietet keine Selbstabholung an.'],
    ['Was passiert, wenn die Lieferung beschaedigt ankommt?', 'Pruefen Sie die Ware bei Empfang. Schaeden sollten direkt dem Zusteller mitgeteilt und Planenadler gemeldet werden, damit Ersatz geleistet werden kann.'],
    ['Verlaengert sich die Lieferzeit in der Hochsaison?', 'Ja. In der Hauptsaison, insbesondere im Fruehjahr und Sommer, kann die Produktion aufgrund hoher Nachfrage laenger dauern.'],
  ]),
  createFaqSection('material', 'Material', [
    ['Welche Hersteller liefern das Material?', 'Planenadler verwendet Planengewebe von renommierten europaeischen Herstellern wie <a href="https://www.mehler-texnologies.com/" target="_blank" rel="noopener noreferrer">Mehler Texnologies</a>, <a href="https://www.sioen.com/" target="_blank" rel="noopener noreferrer">Sioen</a> und <a href="https://www.sergeferrari.com/" target="_blank" rel="noopener noreferrer">Serge Ferrari</a>.'],
    ['Was ist der Unterschied zwischen PE und PVC?', 'PVC besteht aus polyesterverstaerktem Gewebe mit dicker Beschichtung. Es ist sehr reissfest, UV- und schimmelbestaendig und haelt meist ueber zehn Jahre. PE hat eine duennere Beschichtung, ist leichter und guenstiger, aber weniger UV-bestaendig und nur fuer kurzzeitige Anwendungen geeignet.'],
    ['Welche Grammaturen gibt es?', 'PVC-Planen wiegen in der Regel zwischen 500 g/m2 und 950 g/m2. PE-Planen liegen meist zwischen 80 g/m2 und 300 g/m2.'],
    ['Sind die Materialien wasserdicht?', 'Ja. PVC-Planen sind vollstaendig wasserdicht. PE-Planen sind wasserabweisend, aber die Schutzwirkung laesst bei laengerem Gebrauch schneller nach.'],
    ['Wie UV-bestaendig sind die Planen?', 'PVC-Planen bieten einen sehr hohen UV-Schutz. PE-Planen haben deutlich weniger UV-Bestaendigkeit und verblassen schneller.'],
    ['Wie lange halten die Materialien?', 'PVC-Planen koennen bei guter Pflege ueber zehn Jahre genutzt werden. PE-Planen haben eine deutlich kuerzere Lebensdauer.'],
    ['Sind die Planen schimmelresistent?', 'PVC ist resistent gegen Schimmel und Faeulnis. PE kann bei dauerhafter Feuchtigkeit schimmeln.'],
    ['Wie waehle ich das passende Material?', 'Fuer langlebige, stark beanspruchte Anwendungen wie Terrassenplanen, Poolabdeckungen oder Anhaengerplanen ist PVC empfehlenswert. Fuer kurzfristige oder leichte Einsaetze reicht PE.'],
    ['Gibt es umweltfreundliche Materialien?', 'Einige Hersteller bieten recycelte PVC-Materialien oder alternative Gewebe an. Bei Interesse beraten wir Sie gerne zu verfuegbaren Optionen.'],
    ['Wo werden die Materialien produziert?', 'Die verwendeten Gewebe stammen aus europaeischer Produktion, was eine hohe Qualitaet und kurze Transportwege gewaehrleistet.'],
  ]),
  createFaqSection('widerrufsrecht', 'Widerrufsrecht', [
    ['Wie lange kann ich meine Bestellung widerrufen?', 'Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gruenden den Vertrag zu widerrufen.'],
    ['Gilt das Widerrufsrecht auch fuer Massanfertigungen?', 'Nein. Individuell gefertigte Produkte sind vom Widerruf ausgeschlossen.'],
    ['Wie uebe ich mein Widerrufsrecht aus?', 'Sie muessen eine eindeutige Erklaerung, zum Beispiel per E-Mail oder Brief, ueber Ihren Entschluss, den Vertrag zu widerrufen, an den Haendler senden. Alle Details dazu finden Sie auch auf unserer <a href="/widerruf">Widerrufsseite</a>.'],
    ['Bis wann muss ich die Ware zuruecksenden?', 'Die Ware muss innerhalb von 14 Tagen ab Widerruf zurueckgeschickt werden.'],
    ['Wer traegt die Ruecksendekosten?', 'Die Kosten fuer die Ruecksendung traegt der Kaeufer.'],
    ['Wann bekomme ich mein Geld zurueck?', 'Der Haendler erstattet alle Zahlungen innerhalb von 14 Tagen, fruehestens jedoch, wenn die Ware zurueckerhalten wurde.'],
    ['Werden die Lieferkosten erstattet?', 'Nur der Warenwert wird erstattet. Zusaetzliche Lieferkosten werden nicht erstattet.'],
    ['Was passiert, wenn ich die Ware genutzt oder beschaedigt habe?', 'Fuer Wertverluste, die auf einen nicht notwendigen Umgang mit der Ware zurueckzufuehren sind, muessen Sie Schadenersatz leisten.'],
    ['Wie verpacke ich die Ruecksendung?', 'Nutzen Sie moeglichst die Originalverpackung oder eine gleichwertige Verpackung, um Transportschaeden zu vermeiden.'],
    ['Gibt es besondere Rueckgaberegeln fuer defekte Produkte?', 'Bei defekten oder falsch gelieferten Produkten gilt die gesetzliche Gewaehrleistung. Kontaktieren Sie den Kundenservice zur Reklamation.'],
  ]),
  createFaqSection('wie-wir-arbeiten', 'Wie wir arbeiten', [
    ['Seit wann gibt es Planenadler?', 'Das Unternehmen verfuegt ueber mehr als 30 Jahre Erfahrung in der Planenherstellung.'],
    ['Welche Kundengruppen werden bedient?', 'Planenadler beliefert sowohl private als auch gewerbliche Kunden.'],
    ['Wie werden die Planen hergestellt?', 'Es kommen moderne Hot-Air- und Hochfrequenz-Schweissverfahren zum Einsatz, die aesthetische und langlebige Naehte erzeugen. Jede Naht wird sorgfaeltig kontrolliert.'],
    ['Welche Materialien werden verwendet?', 'Es werden ausschliesslich hochwertige, europaeische PVC-Gewebe von Herstellern wie Mehler, Sioen und Serge Ferrari verarbeitet.'],
    ['Wie lange dauert die Anfertigung einer Massplane?', 'Die Produktionszeit liegt in der Regel zwischen 14 und 21 Tagen, je nach Komplexitaet und Saison.'],
    ['Wie laeuft eine Massanfertigung ab?', 'Kunden uebermitteln ihre Masse, waehlen Farbe und Ausstattung wie Oesen, Fenster oder Tueren. Planenadler erstellt ein Angebot und fertigt die Plane nach den Vorgaben.'],
    ['Bieten Sie Beratung fuer Sonderloesungen?', 'Ja. Planenadler stellt umfangreiches Zubehoer bereit, etwa Gummiseile, Drehverschluesse, Kederschienen, Schiebeschienensysteme, Spanner, Pfosten, Bodeneinschlaghuelsen und Wandhalterungen, und beraet bei der Auswahl.'],
    ['Wie gewaehrleistet Planenadler die Qualitaet?', 'Dank langjaehriger Erfahrung, hochwertiger Materialien und sorgfaeltiger Verarbeitung entstehen langlebige Produkte, die viele Jahre halten.'],
    ['Warum sind massgefertigte Planen teurer als Standardplanen?', 'Individuelle Konfektionen erfordern mehr Handarbeit, praezise Messung und spezielle Ausstattung. Daher liegen die Kosten ueber denen von Massenware.'],
    ['Sind Planenadler-Produkte nachhaltig?', 'Durch die hohe Lebensdauer und Wiederverwendbarkeit der Planen wird Abfall reduziert. Die Verwendung europaeischer Materialien mit kurzen Transportwegen traegt ebenfalls zur Nachhaltigkeit bei.'],
  ]),
]

export const ABOUT_FAQ_ITEMS: FaqItem[] = ABOUT_FAQ_SECTIONS.flatMap((section) => section.items)
